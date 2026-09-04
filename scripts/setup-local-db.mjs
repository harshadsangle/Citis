import { spawnSync } from "node:child_process";
import { repositoryRoot } from "./load-local-env.mjs";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const steps = [
  ["db:init", "Apply the LMS database migrations"],
  ["db:seed-demo-learner", "Seed the demo learner"],
  ["db:seed-demo-admin", "Seed the demo administrator"],
  ["db:seed-demo-instructor", "Seed the demo instructor"],
];

for (const [script, description] of steps) {
  console.log(`\n==> ${description}`);
  const result = spawnSync(npmCommand, ["run", script], {
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