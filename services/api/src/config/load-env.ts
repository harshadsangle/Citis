import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";

const localEnvCandidates = [
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), "../../.env.local"),
  resolve(dirname(__dirname), "../../../.env.local"),
];

const localEnvPath = localEnvCandidates.find((candidate, index, candidates) =>
  candidates.indexOf(candidate) === index && existsSync(candidate),
);

if (localEnvPath) {
  // Keep platform-provided environment variables authoritative over local files.
  dotenv.config({ path: localEnvPath, override: false });
}