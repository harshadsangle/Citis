import { spawn, spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicFrontendDir = path.join(rootDir, "citis-infotech", "frontend");
const nextProjectDirs = [
  rootDir,
  path.join(rootDir, "apps", "institution-admin"),
  path.join(rootDir, "apps", "parent-portal"),
  path.join(rootDir, "apps", "student-portal"),
  path.join(rootDir, "apps", "super-admin"),
  path.join(rootDir, "apps", "teacher-portal"),
  publicFrontendDir,
];
const require = createRequire(import.meta.url);
const children = [];
let stopping = false;

function clearNextCaches() {
  for (const projectDir of nextProjectDirs) {
    rmSync(path.join(projectDir, ".next"), { recursive: true, force: true });
  }
}

function resolveNextBin(projectDir) {
  return require.resolve("next/dist/bin/next", { paths: [projectDir] });
}

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
    cwd: options.cwd ?? rootDir,
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
  // Clear generated state before startup so a previous root-level build cannot
  // collide with a development cache.
  clearNextCaches();

  // Keep the API rooted at the repository while starting each Next app from
  // its own project directory. The public frontend has a legacy duplicate
  // App Router tree at the repository root.
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

  const publicNextBin = resolveNextBin(publicFrontendDir);
  const portalNextBin = resolveNextBin(rootDir);
  launch("frontend", [
    publicNextBin,
    "dev",
    "--turbopack",
    "--hostname",
    "0.0.0.0",
    "--port",
    "5000",
  ], { cwd: publicFrontendDir });
  launch("student-portal", [
    portalNextBin,
    "dev",
    "apps/student-portal",
    "--hostname",
    "0.0.0.0",
    "--port",
    "4103",
  ]);
  launch("institution-admin", [
    portalNextBin,
    "dev",
    "apps/institution-admin",
    "--hostname",
    "0.0.0.0",
    "--port",
    "4101",
  ]);
  launch("teacher-portal", [
    portalNextBin,
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