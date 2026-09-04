import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const children = [];
let stopping = false;

function stop(exitCode) {
  if (stopping) return;
  stopping = true;

  for (const child of children) {
    if (!child.killed && child.pid) {
      if (process.platform === "win32") {
        spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
          stdio: "ignore",
          windowsHide: true,
        });
      } else {
        child.kill("SIGTERM");
      }
    }
  }

  const forceExit = setTimeout(() => process.exit(exitCode), 2_500);
  forceExit.unref();
}

function launch(label, args, options = {}) {
  const child = spawn(process.execPath, args, {
    cwd: rootDir,
    env: options.env ?? process.env,
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
  return child;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForHttp(label, url, child, timeoutMilliseconds = 30_000) {
  const deadline = Date.now() + timeoutMilliseconds;
  let lastError = "no response";

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`${label} exited before becoming ready (code ${child.exitCode ?? "unknown"}).`);
    }

    try {
      await fetch(url, { signal: AbortSignal.timeout(1_000) });
      console.log(`[${label}] ready at ${url}`);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await wait(250);
    }
  }

  throw new Error(`${label} did not become ready within ${timeoutMilliseconds}ms: ${lastError}`);
}

process.on("SIGINT", () => stop(130));
process.on("SIGTERM", () => stop(143));

if (process.platform === "win32") {
  // Invoke both services from the repository root. Calling the nested npm
  // wrapper here would recreate the duplicated frontend path on Windows.
  const api = launch("api", [
    require.resolve("ts-node/dist/bin.js"),
    "--project",
    "services/api/tsconfig.json",
    "services/api/src/main.ts",
  ], { env: { ...process.env, PORT: "4000" } });

  try {
    await waitForHttp("api", "http://127.0.0.1:4000/", api);
  } catch (error) {
    console.error(`[api] startup readiness check failed: ${error instanceof Error ? error.message : error}`);
    stop(1);
    await new Promise(() => {});
  }

  const nextBin = require.resolve("next/dist/bin/next");
  launch("frontend", [
    nextBin,
    "dev",
    "citis-infotech/frontend",
    "--turbopack",
    "--hostname",
    "0.0.0.0",
    "--port",
    "5000",
  ]);
  launch("student-portal", [
    nextBin,
    "dev",
    "apps/student-portal",
    "--hostname",
    "0.0.0.0",
    "--port",
    "4103",
  ]);
  launch("institution-admin", [
    nextBin,
    "dev",
    "apps/institution-admin",
    "--hostname",
    "0.0.0.0",
    "--port",
    "4101",
  ]);
  launch("teacher-portal", [
    nextBin,
    "dev",
    "apps/teacher-portal",
    "--hostname",
    "0.0.0.0",
    "--port",
    "4102",
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