import { spawnSync } from "node:child_process";
import { repositoryRoot } from "./load-local-env.mjs";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? (process.env.ComSpec || process.env.COMSPEC || "cmd.exe") : "npm";
const steps = [
  ["db:init", "Apply the LMS database migrations"],
  ["db:seed-demo-learner", "Seed the demo learner"],
  ["db:seed-demo-admin", "Seed the demo administrator"],
  ["db:seed-demo-instructor", "Seed the demo instructor"],
];

for (const [script, description] of steps) {
  console.log(`\n==> ${description}`);
  const commandArgs = isWindows
    ? ["/d", "/s", "/c", `npm.cmd run ${script}`]
    : ["run", script];
  const result = spawnSync(npmCommand, commandArgs, {
    cwd: repositoryRoot,
    env: process.env,
    stdio: "inherit",
    windowsHide: false,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\nLocal LMS database setup is complete.");