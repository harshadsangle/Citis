import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendDir = path.join(rootDir, "citis-infotech", "frontend");
const nextEntrypoint = path.join(frontendDir, "node_modules", "next", "dist", "bin", "next");

if (existsSync(nextEntrypoint)) {
  console.log("Public frontend dependencies are already installed.");
  process.exit(0);
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(
  npmCommand,
  ["install", "--prefix", frontendDir, "--ignore-scripts"],
  {
    cwd: rootDir,
    stdio: "inherit",
    windowsHide: false,
  },
);

if (result.error) {
  console.error(`Unable to install public frontend dependencies: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);