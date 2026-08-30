import "reflect-metadata";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "pg";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    for (const version of ["001_foundation", "002_lms_course_management"]) {
      const migration = await readFile(resolve(process.cwd(), `packages/database/migrations/${version}.sql`), "utf8");
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