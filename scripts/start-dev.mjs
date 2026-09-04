import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const children = [];
let stopping = false;

function stop(exitCode) {
  if (stopping) return;
  stopping = true;

  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }

  const forceExit = setTimeout(() => process.exit(exitCode), 2_500);
  forceExit.unref();
}

function launch(label, args) {
  const child = spawn(process.execPath, args, {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit",
    windowsHide: false,
  });
  children.push(child);

  child.on("error", (error) => {
    console.error(`[${label}] failed to start: ${error.message}`);
    stop(1);
  });
  child.on("exit", (code, signal) => {
    if (!stopping) {
      const status = signal ? `signal ${signal}` : `exit ${code ?? 1}`;
      console.error(`[${label}] stopped with ${status}`);
      stop(code ?? 1);
    }
  });
}

process.on("SIGINT", () => stop(130));
process.on("SIGTERM", () => stop(143));

if (process.platform === "win32") {
  // Invoke both services from the repository root. Calling the nested npm
  // wrapper here would recreate the duplicated frontend path on Windows.
  launch("api", [
    path.join(rootDir, "node_modules", "ts-node", "dist", "bin.js"),
    "--project",
    "services/api/tsconfig.json",
    "services/api/src/main.ts",
  ]);
  launch("frontend", [
    path.join(rootDir, "node_modules", "next", "dist", "bin", "next"),
    "dev",
    "citis-infotech/frontend",
    "--turbopack",
    "--hostname",
    "0.0.0.0",
    "--port",
    "5000",
  ]);
} else {
  const child = spawn("bash", ["scripts/start-all-dev.sh"], {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit",
  });
  children.push(child);

  child.on("error", (error) => {
    console.error(`[linux] failed to start: ${error.message}`);
    stop(1);
  });
  child.on("exit", (code, signal) => {
    if (!stopping) {
      const status = signal ? `signal ${signal}` : `exit ${code ?? 1}`;
      console.error(`[linux] workflow stopped with ${status}`);
      stop(code ?? 1);
    }
  });
}

await new Promise(() => {});