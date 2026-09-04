import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";

function localEnvironmentCandidates() {
  // Resolve these roots from the API source location first. This is stable
  // when npm launches the API from the repository root, the API workspace, or
  // a Windows shell with a different current directory.
  const apiRoot = resolve(__dirname, "../..");
  const repositoryRoot = resolve(apiRoot, "../..");
  const roots = [apiRoot, process.env.INIT_CWD, process.cwd(), repositoryRoot]
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

  // The API-local file is preferred when present; the repository root file is
  // the supported fallback used by the Windows local setup. Platform-provided
  // values remain the fallback only when neither local file exists.
  dotenv.config({ path: localEnvPath, override: true, quiet: true });
}

loadLocalEnvironment();