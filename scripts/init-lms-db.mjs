import { spawnSync } from "node:child_process";
import { repositoryRoot } from "./load-local-env.mjs";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? (process.env.ComSpec || process.env.COMSPEC || "cmd.exe") : "npm";
const commandArgs = isWindows
  ? ["/d", "/s", "/c", "npm.cmd run db:migrate --workspace @citis/api"]
  : ["run", "db:migrate", "--workspace", "@citis/api"];
const result = spawnSync(npmCommand, commandArgs, {
  cwd: repositoryRoot,
  env: process.env,
  stdio: "inherit",
  windowsHide: false,
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);