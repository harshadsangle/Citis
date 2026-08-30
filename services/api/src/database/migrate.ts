import "reflect-metadata";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "pg";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const migrationRootCandidates = [
      resolve(process.cwd(), "packages/database/migrations"),
      resolve(process.cwd(), "../../packages/database/migrations"),
    ];
    const migrationRoot = await migrationRootCandidates.reduce<Promise<string | null>>(async (current, candidate) => {
      const found = await current;
      if (found) return found;
      try {
        await access(candidate);
        return candidate;
      } catch {
        return null;
      }
    }, Promise.resolve(null));
    if (!migrationRoot) throw new Error("Could not locate packages/database/migrations from the current working directory.");

    for (const version of ["001_foundation", "002_lms_course_management", "003_lms_managed_resources", "004_lms_enrollment_assignments", "005_lms_progress_tracking"]) {
      const migration = await readFile(resolve(migrationRoot, `${version}.sql`), "utf8");
      await client.query(migration);
      console.log(`Applied ${version}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Database migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});