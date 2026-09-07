import { spawnSync } from "node:child_process";
import { repositoryRoot } from "./load-local-env.mjs";

const isWindows = process.platform === "win32";
const configuredComSpec = process.env.ComSpec || process.env.COMSPEC;
const windowsShell = (configuredComSpec || `${process.env.SystemRoot || "C:\\Windows"}\\System32\\cmd.exe`)
  .replace(/^"(.*)"$/, "$1");
const npmCommand = isWindows ? windowsShell : "npm";
const commandArgs = isWindows
  ? ["/d", "/s", "/c", "npm.cmd run db:migrate --workspace @citis/api"]
  : ["run", "db:migrate", "--workspace", "@citis/api"];
const result = spawnSync(npmCommand, commandArgs, {
  cwd: repositoryRoot,
  env: process.env,
  stdio: "inherit",
  shell: false,
  windowsHide: false,
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);