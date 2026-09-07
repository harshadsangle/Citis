import { spawn, spawnSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
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

function readWindowsDatabaseUrl() {
  try {
    const rootEnvironment = readFileSync(path.join(rootDir, ".env.local"), "utf8");
    const databaseLine = rootEnvironment
      .split(/\r?\n/)
      .find((line) => /^\s*(?:export\s+)?DATABASE_URL\s*=/.test(line));
    if (databaseLine) {
      const value = databaseLine.replace(/^\s*(?:export\s+)?DATABASE_URL\s*=\s*/, "").trim();
      return value.replace(/^(['"])(.*)\1$/, "$2").trim();
    }
  } catch {
    // Fall back to the inherited environment when the local file is absent.
  }

  return process.env.DATABASE_URL?.trim() || "";
}

function hasConfiguredWindowsDatabase() {
  const connectionString = readWindowsDatabaseUrl();
  if (!connectionString) return false;

  try {
    return new URL(connectionString).hostname.toLowerCase() !== "helium";
  } catch {
    return false;
  }
}

function launchNpmScript(label, projectDir) {
  if (process.platform === "win32") {
    const comSpec = process.env.ComSpec || process.env.COMSPEC || "cmd.exe";
    launchCommand(label, comSpec, ["/d", "/s", "/c", "npm.cmd run dev"], {
      cwd: projectDir,
    });
    return;
  }

  launchCommand(label, "npm", ["run", "dev"], { cwd: projectDir });
}

function launchPublicFrontend() {
  launchNpmScript("frontend", publicFrontendDir);
}

function launchPortals() {
  launchNpmScript("student-portal", path.join(rootDir, "apps", "student-portal"));
  launchNpmScript("institution-admin", path.join(rootDir, "apps", "institution-admin"));
  launchNpmScript("teacher-portal", path.join(rootDir, "apps", "teacher-portal"));
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

function launchCommand(label, command, args, options = {}) {
  const child = spawn(command, args, {
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

function launch(label, args, options = {}) {
  return launchCommand(label, process.execPath, args, options);
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

function waitForChildren() {
  if (children.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    let resolved = false;
    const resolveOnce = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };

    for (const child of children) {
      if (child.exitCode !== null) {
        resolveOnce();
      } else {
        child.once("exit", resolveOnce);
      }
    }
  });
}

async function startWindowsServices() {
  // Clear generated state before startup so a previous root-level build cannot
  // collide with a development cache.
  clearNextCaches();

  if (!hasConfiguredWindowsDatabase()) {
    console.warn("[windows] DATABASE_URL is missing, malformed, or points to the Replit-internal helium host; starting the public frontend only. Configure an external DATABASE_URL in the repository-root .env.local to enable the API and LMS portals.");
    launchPublicFrontend();
    return;
  }

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
    process.exitCode = 1;
    stop(1);
    return;
  }

  launchPortals();
  launchPublicFrontend();
}

async function main() {
  process.on("SIGINT", () => stop(130));
  process.on("SIGTERM", () => stop(143));

  if (process.platform === "win32") {
    await startWindowsServices();
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

  await waitForChildren();
}

main().catch((error) => {
  console.error(`[dev] startup failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
  stop(1);
});