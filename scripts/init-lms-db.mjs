import { spawnSync } from "node:child_process";
import { repositoryRoot } from "./load-local-env.mjs";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npmCommand, ["run", "db:migrate", "--workspace", "@citis/api"], {
  cwd: repositoryRoot,
  env: process.env,
  stdio: "inherit",
  windowsHide: false,
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);