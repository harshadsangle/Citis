import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, normalize, posix, relative, resolve } from "node:path";
import { BadRequestException, Injectable } from "@nestjs/common";
import unzipper from "unzipper";

export interface LmsUpload {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface StoredFile {
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  byteSize: number;
  sha256: string;
  entrypoint?: string;
}

const MAX_MANAGED_FILE_BYTES = 50 * 1024 * 1024;
const MAX_SCORM_BYTES = 250 * 1024 * 1024;
const MAX_SCORM_ENTRIES = 5_000;
const MAX_SCORM_UNCOMPRESSED_BYTES = 500 * 1024 * 1024;
const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.presentation",
]);
const DOCUMENT_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".odt", ".ppt", ".pptx", ".odp"]);

export function mimeTypeForFilename(filename: string) {
  switch (extname(filename).toLowerCase()) {
    case ".html":
    case ".htm":
      return "text/html";
    case ".css":
      return "text/css";
    case ".js":
      return "text/javascript";
    case ".json":
      return "application/json";
    case ".xml":
      return "application/xml";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}

function safeArchivePath(input: string) {
  const value = input.replaceAll("\\", "/");
  if (!value || value.includes("\0") || posix.isAbsolute(value)) throw new BadRequestException("The SCORM package contains an unsafe path.");
  const normalized = posix.normalize(value);
  if (normalized === ".." || normalized.startsWith("../")) throw new BadRequestException("The SCORM package contains an unsafe path.");
  return normalized;
}

function safeStorageKey(storageKey: string) {
  const root = resolve(process.env.LMS_STORAGE_DIR || join(process.cwd(), "var", "lms-storage"));
  const destination = resolve(root, storageKey);
  if (relative(root, destination).startsWith("..")) throw new BadRequestException("The managed file path is invalid.");
  return { root, destination };
}

@Injectable()
export class ResourceStorageService {
  async storeDocument(tenantId: string, resourceId: string, file: LmsUpload): Promise<StoredFile> {
    if (!file || !file.buffer?.length) throw new BadRequestException("A file is required.");
    if (file.size > MAX_MANAGED_FILE_BYTES || file.buffer.length > MAX_MANAGED_FILE_BYTES) {
      throw new BadRequestException("Managed files must be 50 MB or smaller.");
    }
    const extension = extname(file.originalname).toLowerCase();
    if (!DOCUMENT_EXTENSIONS.has(extension) || !DOCUMENT_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException("Only PDF, Word, OpenDocument text, PowerPoint, and presentation files are supported.");
    }
    const storageKey = `${tenantId}/${resourceId}/${randomUUID()}${extension}`;
    const { destination } = safeStorageKey(storageKey);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, file.buffer, { flag: "wx" });
    return {
      storageKey,
      originalFilename: basename(file.originalname).slice(0, 255),
      mimeType: file.mimetype,
      byteSize: file.buffer.length,
      sha256: createHash("sha256").update(file.buffer).digest("hex"),
    };
  }

  async storeScormPackage(tenantId: string, resourceId: string, file: LmsUpload): Promise<StoredFile> {
    if (!file || !file.buffer?.length) throw new BadRequestException("A SCORM package is required.");
    if (file.size > MAX_SCORM_BYTES || file.buffer.length > MAX_SCORM_BYTES) {
      throw new BadRequestException("SCORM packages must be 250 MB or smaller.");
    }
    if (extname(file.originalname).toLowerCase() !== ".zip" && file.mimetype !== "application/zip") {
      throw new BadRequestException("SCORM packages must be ZIP files.");
    }

    let archive: unzipper.CentralDirectory;
    try {
      archive = await unzipper.Open.buffer(file.buffer);
    } catch {
      throw new BadRequestException("The SCORM package is not a valid ZIP archive.");
    }
    if (archive.files.length > MAX_SCORM_ENTRIES) throw new BadRequestException("The SCORM package contains too many files.");

    const packageKey = `${tenantId}/${resourceId}/${randomUUID()}`;
    const { destination: packageDirectory } = safeStorageKey(packageKey);
    let uncompressedBytes = 0;
    const files = new Set<string>();
    let manifestPath = "";
    try {
      await mkdir(packageDirectory, { recursive: true });
      for (const entry of archive.files) {
        const entryPath = safeArchivePath(entry.path);
        if (entry.type === "File") {
          const entryBuffer = await entry.buffer();
          uncompressedBytes += entryBuffer.length;
          if (uncompressedBytes > MAX_SCORM_UNCOMPRESSED_BYTES) {
            throw new BadRequestException("The SCORM package expands beyond the 500 MB safety limit.");
          }
          const destination = join(packageDirectory, entryPath);
          const relativeDestination = relative(packageDirectory, normalize(destination));
          if (relativeDestination.startsWith("..")) throw new BadRequestException("The SCORM package contains an unsafe path.");
          await mkdir(dirname(destination), { recursive: true });
          await writeFile(destination, entryBuffer, { flag: "wx" });
          files.add(entryPath);
          if (entryPath.toLowerCase() === "imsmanifest.xml") manifestPath = entryPath;
        }
      }
      if (!manifestPath) throw new BadRequestException("The SCORM package must contain imsmanifest.xml.");
      const manifest = await readFile(join(packageDirectory, manifestPath), "utf8");
      const entrypoint = this.findEntrypoint(manifest, files);
      return {
        storageKey: packageKey,
        originalFilename: basename(file.originalname).slice(0, 255),
        mimeType: "application/zip",
        byteSize: file.buffer.length,
        sha256: createHash("sha256").update(file.buffer).digest("hex"),
        entrypoint,
      };
    } catch (error) {
      await rm(packageDirectory, { recursive: true, force: true });
      throw error;
    }
  }

  async read(storageKey: string) {
    const { destination } = safeStorageKey(storageKey);
    return readFile(destination);
  }

  async readScormAsset(storageKey: string, assetPath: string) {
    const safePath = safeArchivePath(assetPath);
    const { destination: packageDirectory } = safeStorageKey(storageKey);
    const destination = resolve(packageDirectory, safePath);
    if (relative(packageDirectory, destination).startsWith("..")) throw new BadRequestException("The SCORM asset path is invalid.");
    return readFile(destination);
  }

  async remove(storageKey: string) {
    const { destination } = safeStorageKey(storageKey);
    await rm(destination, { recursive: true, force: true });
  }

  private findEntrypoint(manifest: string, files: Set<string>) {
    const resources = [...manifest.matchAll(/<resource\b([^>]*)>/gi)];
    const scoCandidates: string[] = [];
    const fallbackCandidates: string[] = [];
    for (const resource of resources) {
      const attributes = resource[1];
      const type = attributes.match(/(?:adlcp:)?scormtype\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
      const href = attributes.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
      if (href && type === "sco") scoCandidates.push(href);
      else if (href && (!type || type === "asset")) fallbackCandidates.push(href);
    }
    const entrypoint = [...scoCandidates, ...fallbackCandidates].find((candidate) => {
      try {
        return files.has(safeArchivePath(candidate.split(/[?#]/, 1)[0]));
      } catch {
        return false;
      }
    });
    if (!entrypoint) throw new BadRequestException("The SCORM manifest does not reference a file in the package.");
    return safeArchivePath(entrypoint.split(/[?#]/, 1)[0]);
  }
}