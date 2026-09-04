import { existsSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";

function localEnvironmentCandidates() {
  // Resolve these roots from the API source location first. This is stable
  // when npm launches the API from the repository root, the API workspace, or
  // a Windows shell with a different current directory.
  const apiRoot = resolve(__dirname, "../..");
  const repositoryRoot = resolve(apiRoot, "../..");
  // Windows local development owns the repository root .env.local. Do not
  // fall back to the API-local file there: that file is the Replit/Linux
  // override and may contain an internal-only database host.
  // Replit runs on Linux and keeps the API-local file as its existing first
  // choice.
  const roots = (process.platform === "win32"
    ? [repositoryRoot]
    : [apiRoot, process.env.INIT_CWD, process.cwd(), repositoryRoot])
    .filter((root): root is string => Boolean(root))
    .map((root) => resolve(root));

  return [...new Set(roots)].map((root) => resolve(root, ".env.local"));
}

export function getLocalEnvironmentPath() {
  return localEnvironmentCandidates().find((candidate) => existsSync(candidate));
}

export function loadLocalEnvironment() {
  const localEnvPath = getLocalEnvironmentPath();
  if (!localEnvPath) return;

  // Local files override inherited platform values. On Windows the repository
  // root file wins; on Linux/Replit the API-local file remains authoritative.
  dotenv.config({ path: localEnvPath, override: true, quiet: true });
}

loadLocalEnvironment();