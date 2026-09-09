import { mkdir, readFile, realpath, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, pathToFileURL, relative, resolve } from "node:path";

const STORAGE_KEY_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function configuredRoot() {
  return resolve(process.env.LMS_STORAGE_DIR || join(process.cwd(), "var", "lms-storage"));
}

function assertInsideRoot(root, candidate) {
  const relativePath = relative(root, candidate);
  if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
    throw new Error("Refusing to use a managed file path outside LMS storage.");
  }
}

function pathForKey(storageKey) {
  if (
    typeof storageKey !== "string" ||
    !storageKey ||
    storageKey.includes("\0") ||
    storageKey.includes("\\") ||
    storageKey.startsWith("/") ||
    storageKey.split("/").some((segment) => !STORAGE_KEY_SEGMENT.test(segment))
  ) {
    throw new Error("Refusing to use an invalid managed file storage key.");
  }

  const root = configuredRoot();
  const destination = resolve(root, ...storageKey.split("/"));
  assertInsideRoot(root, destination);
  return { root, destination };
}

async function canonicalRoot() {
  const root = configuredRoot();
  await mkdir(root, { recursive: true });
  return realpath(root);
}

async function assertExistingPathIsManaged(root, destination) {
  const canonicalDestination = await realpath(destination);
  assertInsideRoot(root, canonicalDestination);
  return canonicalDestination;
}

export async function managedFileExists(storageKey) {
  const { destination } = pathForKey(storageKey);
  try {
    const root = await canonicalRoot();
    await stat(destination);
    await assertExistingPathIsManaged(root, destination);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

export async function readManagedFile(storageKey) {
  const { destination } = pathForKey(storageKey);
  const root = await canonicalRoot();
  const safeDestination = await assertExistingPathIsManaged(root, destination);
  // nosemgrep: javascript.express.file.fs-express.fs-express -- safeDestination is realpath-checked inside canonicalRoot.
  return readFile(pathToFileURL(safeDestination));
}

export async function writeManagedFile(storageKey, content) {
  const { destination } = pathForKey(storageKey);
  const root = await canonicalRoot();
  const safeDirectoryPath = dirname(destination);
  // nosemgrep: javascript.express.file.fs-express.fs-express -- destination was allowlisted and its canonical parent is checked below.
  await mkdir(pathToFileURL(safeDirectoryPath), { recursive: true });
  const safeDirectory = await realpath(safeDirectoryPath);
  assertInsideRoot(root, safeDirectory);
  // nosemgrep: javascript.express.file.fs-express.fs-express -- destination is a validated managed-storage URL.
  await writeFile(pathToFileURL(destination), content, { flag: "wx" });
}

export async function removeManagedFile(storageKey) {
  const { destination } = pathForKey(storageKey);
  try {
    const root = await canonicalRoot();
    const safeDestination = await assertExistingPathIsManaged(root, destination);
    await unlink(pathToFileURL(safeDestination));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}