"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceStorageService = void 0;
exports.mimeTypeForFilename = mimeTypeForFilename;
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const common_1 = require("@nestjs/common");
const unzipper_1 = __importDefault(require("unzipper"));
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
function mimeTypeForFilename(filename) {
    switch ((0, node_path_1.extname)(filename).toLowerCase()) {
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
function safeArchivePath(input) {
    const value = input.replaceAll("\\", "/");
    if (!value || value.includes("\0") || node_path_1.posix.isAbsolute(value))
        throw new common_1.BadRequestException("The SCORM package contains an unsafe path.");
    const normalized = node_path_1.posix.normalize(value);
    if (normalized === ".." || normalized.startsWith("../"))
        throw new common_1.BadRequestException("The SCORM package contains an unsafe path.");
    return normalized;
}
function safeStorageKey(storageKey) {
    const root = (0, node_path_1.resolve)(process.env.LMS_STORAGE_DIR || (0, node_path_1.join)(process.cwd(), "var", "lms-storage"));
    const destination = (0, node_path_1.resolve)(root, storageKey);
    if ((0, node_path_1.relative)(root, destination).startsWith(".."))
        throw new common_1.BadRequestException("The managed file path is invalid.");
    return { root, destination };
}
let ResourceStorageService = class ResourceStorageService {
    async storeDocument(tenantId, resourceId, file) {
        if (!file || !file.buffer?.length)
            throw new common_1.BadRequestException("A file is required.");
        if (file.size > MAX_MANAGED_FILE_BYTES || file.buffer.length > MAX_MANAGED_FILE_BYTES) {
            throw new common_1.BadRequestException("Managed files must be 50 MB or smaller.");
        }
        const extension = (0, node_path_1.extname)(file.originalname).toLowerCase();
        if (!DOCUMENT_EXTENSIONS.has(extension) || !DOCUMENT_MIME_TYPES.has(file.mimetype)) {
            throw new common_1.BadRequestException("Only PDF, Word, OpenDocument text, PowerPoint, and presentation files are supported.");
        }
        const storageKey = `${tenantId}/${resourceId}/${(0, node_crypto_1.randomUUID)()}${extension}`;
        const { destination } = safeStorageKey(storageKey);
        await (0, promises_1.mkdir)((0, node_path_1.dirname)(destination), { recursive: true });
        await (0, promises_1.writeFile)(destination, file.buffer, { flag: "wx" });
        return {
            storageKey,
            originalFilename: (0, node_path_1.basename)(file.originalname).slice(0, 255),
            mimeType: file.mimetype,
            byteSize: file.buffer.length,
            sha256: (0, node_crypto_1.createHash)("sha256").update(file.buffer).digest("hex"),
        };
    }
    async storeScormPackage(tenantId, resourceId, file) {
        if (!file || !file.buffer?.length)
            throw new common_1.BadRequestException("A SCORM package is required.");
        if (file.size > MAX_SCORM_BYTES || file.buffer.length > MAX_SCORM_BYTES) {
            throw new common_1.BadRequestException("SCORM packages must be 250 MB or smaller.");
        }
        if ((0, node_path_1.extname)(file.originalname).toLowerCase() !== ".zip" && file.mimetype !== "application/zip") {
            throw new common_1.BadRequestException("SCORM packages must be ZIP files.");
        }
        let archive;
        try {
            archive = await unzipper_1.default.Open.buffer(file.buffer);
        }
        catch {
            throw new common_1.BadRequestException("The SCORM package is not a valid ZIP archive.");
        }
        if (archive.files.length > MAX_SCORM_ENTRIES)
            throw new common_1.BadRequestException("The SCORM package contains too many files.");
        const packageKey = `${tenantId}/${resourceId}/${(0, node_crypto_1.randomUUID)()}`;
        const { destination: packageDirectory } = safeStorageKey(packageKey);
        let uncompressedBytes = 0;
        const files = new Set();
        let manifestPath = "";
        try {
            await (0, promises_1.mkdir)(packageDirectory, { recursive: true });
            for (const entry of archive.files) {
                const entryPath = safeArchivePath(entry.path);
                if (entry.type === "File") {
                    const entryBuffer = await entry.buffer();
                    uncompressedBytes += entryBuffer.length;
                    if (uncompressedBytes > MAX_SCORM_UNCOMPRESSED_BYTES) {
                        throw new common_1.BadRequestException("The SCORM package expands beyond the 500 MB safety limit.");
                    }
                    const destination = (0, node_path_1.join)(packageDirectory, entryPath);
                    const relativeDestination = (0, node_path_1.relative)(packageDirectory, (0, node_path_1.normalize)(destination));
                    if (relativeDestination.startsWith(".."))
                        throw new common_1.BadRequestException("The SCORM package contains an unsafe path.");
                    await (0, promises_1.mkdir)((0, node_path_1.dirname)(destination), { recursive: true });
                    await (0, promises_1.writeFile)(destination, entryBuffer, { flag: "wx" });
                    files.add(entryPath);
                    if (entryPath.toLowerCase() === "imsmanifest.xml")
                        manifestPath = entryPath;
                }
            }
            if (!manifestPath)
                throw new common_1.BadRequestException("The SCORM package must contain imsmanifest.xml.");
            const manifest = await (0, promises_1.readFile)((0, node_path_1.join)(packageDirectory, manifestPath), "utf8");
            const entrypoint = this.findEntrypoint(manifest, files);
            return {
                storageKey: packageKey,
                originalFilename: (0, node_path_1.basename)(file.originalname).slice(0, 255),
                mimeType: "application/zip",
                byteSize: file.buffer.length,
                sha256: (0, node_crypto_1.createHash)("sha256").update(file.buffer).digest("hex"),
                entrypoint,
            };
        }
        catch (error) {
            await (0, promises_1.rm)(packageDirectory, { recursive: true, force: true });
            throw error;
        }
    }
    async read(storageKey) {
        const { destination } = safeStorageKey(storageKey);
        return (0, promises_1.readFile)(destination);
    }
    async readScormAsset(storageKey, assetPath) {
        const safePath = safeArchivePath(assetPath);
        const { destination: packageDirectory } = safeStorageKey(storageKey);
        const destination = (0, node_path_1.resolve)(packageDirectory, safePath);
        if ((0, node_path_1.relative)(packageDirectory, destination).startsWith(".."))
            throw new common_1.BadRequestException("The SCORM asset path is invalid.");
        return (0, promises_1.readFile)(destination);
    }
    async remove(storageKey) {
        const { destination } = safeStorageKey(storageKey);
        await (0, promises_1.rm)(destination, { recursive: true, force: true });
    }
    findEntrypoint(manifest, files) {
        const resources = [...manifest.matchAll(/<resource\b([^>]*)>/gi)];
        const scoCandidates = [];
        const fallbackCandidates = [];
        for (const resource of resources) {
            const attributes = resource[1];
            const type = attributes.match(/(?:adlcp:)?scormtype\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
            const href = attributes.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
            if (href && type === "sco")
                scoCandidates.push(href);
            else if (href && (!type || type === "asset"))
                fallbackCandidates.push(href);
        }
        const entrypoint = [...scoCandidates, ...fallbackCandidates].find((candidate) => {
            try {
                return files.has(safeArchivePath(candidate.split(/[?#]/, 1)[0]));
            }
            catch {
                return false;
            }
        });
        if (!entrypoint)
            throw new common_1.BadRequestException("The SCORM manifest does not reference a file in the package.");
        return safeArchivePath(entrypoint.split(/[?#]/, 1)[0]);
    }
};
exports.ResourceStorageService = ResourceStorageService;
exports.ResourceStorageService = ResourceStorageService = __decorate([
    (0, common_1.Injectable)()
], ResourceStorageService);
//# sourceMappingURL=resource-storage.service.js.map