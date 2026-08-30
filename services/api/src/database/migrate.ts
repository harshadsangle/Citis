import "reflect-metadata";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "pg";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const migration = await readFile(resolve(process.cwd(), "packages/database/migrations/001_foundation.sql"), "utf8");
    await client.query(migration);
    console.log("Applied 001_foundation");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Database migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});