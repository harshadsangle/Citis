import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";

const projectRoots = [
  process.env.INIT_CWD,
  process.cwd(),
  resolve(dirname(__dirname), "../../../"),
].filter((root): root is string => Boolean(root));

const localEnvPath = projectRoots
  .map((root) => resolve(root, ".env.local"))
  .find((candidate, index, candidates) => candidates.indexOf(candidate) === index && existsSync(candidate));

if (localEnvPath) {
  // In local development, the explicit .env.local file is the source of truth.
  // Platform-provided values remain the fallback when no local file exists.
  dotenv.config({ path: localEnvPath, override: true, quiet: true });
}