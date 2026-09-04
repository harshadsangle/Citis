import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const candidates = process.platform === "win32"
  ? [resolve(repositoryRoot, ".env.local")]
  : [
      resolve(repositoryRoot, "services/api/.env.local"),
      process.env.INIT_CWD ? resolve(process.env.INIT_CWD, ".env.local") : null,
      resolve(process.cwd(), ".env.local"),
      resolve(repositoryRoot, ".env.local"),
    ];

export const localEnvironmentPath = candidates
  .filter((candidate) => candidate && existsSync(candidate))
  .find(Boolean) || null;

if (localEnvironmentPath) {
  dotenv.config({ path: localEnvironmentPath, override: true, quiet: true });
}