import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const lockfiles = [
  "package-lock.json",
  "citis-infotech/frontend/package-lock.json",
  "citis-infotech/strapi-cms/package-lock.json",
];
const replitRegistryPrefixes = [
  "http://package-firewall.replit.internal/npm/",
  "http://package-firewall.replit.local/npm/",
  "https://package-firewall.replit.internal/npm/",
  "https://package-firewall.replit.local/npm/",
];
const publicRegistryPrefix = "https://registry.npmjs.org/";

for (const lockfile of lockfiles) {
  const path = resolve(projectRoot, lockfile);
  let content;

  try {
    content = readFileSync(path, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") continue;
    throw error;
  }

  const sanitized = replitRegistryPrefixes.reduce(
    (current, prefix) => current.replaceAll(prefix, publicRegistryPrefix),
    content,
  );

  if (sanitized !== content) {
    writeFileSync(path, sanitized);
    console.log(`Prepared ${lockfile} for the public npm registry.`);
  }
}