import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { Client } from "pg";
import { repositoryRoot } from "./load-local-env.mjs";

const version = "030_lms_course_approval_workflow";
const approvalColumns = ["rejection_reason", "rejected_by", "rejected_at", "published_by", "published_at"];

// Explicit local repair only: never run schema changes from API startup.
export async function repairCourseApproval(client) {
  const sql = await readFile(resolve(repositoryRoot, `packages/database/migrations/${version}.sql`), "utf8");
  const checksum = createHash("sha256").update(sql).digest("hex");
  await client.query("BEGIN");
  try {
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SELECT pg_advisory_xact_lock(728431::bigint)");
    await client.query("LOCK TABLE courses IN ACCESS EXCLUSIVE MODE");
    const columns = (await client.query(`
      SELECT attname FROM pg_attribute
      WHERE attrelid = 'courses'::regclass AND attnum > 0 AND NOT attisdropped
    `)).rows.map((row) => row.attname);
    const missing = approvalColumns.filter((name) => !columns.includes(name));
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migration_checksums (
        version text PRIMARY KEY, checksum text NOT NULL,
        recorded_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    const stored = (await client.query(
      "SELECT checksum FROM schema_migration_checksums WHERE version = $1", [version],
    )).rows[0]?.checksum;
    if (stored && stored !== checksum) {
      throw new Error("Migration 030 checksum mismatch. Refusing to rewrite migration history.");
    }
    // Compare all existing course fields, including approval metadata when present.
    // Newly added nullable columns are excluded from this before/after comparison.
    const snapshot = async () => (await client.query(`
      SELECT id, to_jsonb(c) - $1::text[] AS record FROM courses c ORDER BY id
    `, [missing])).rows;
    const before = await snapshot();
    await client.query(sql);
    if (JSON.stringify(before) !== JSON.stringify(await snapshot())) {
      throw new Error("Course data changed unexpectedly. Rolling back the repair.");
    }
    await client.query(`
      INSERT INTO schema_migration_checksums(version, checksum)
      VALUES ($1, $2) ON CONFLICT (version) DO NOTHING
    `, [version, checksum]);
    await client.query(`
      SELECT c.rejection_reason, c.rejected_by, c.rejected_at, c.published_by, c.published_at
      FROM courses c LIMIT 0
    `);
    await client.query("COMMIT");
    return { version, addedColumns: missing, coursesPreserved: before.length, checksumVerified: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("This repair is for local development only.");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log("Local database:", (await client.query(
      "SELECT current_database() AS database, current_schema() AS schema",
    )).rows[0]);
    console.log(await repairCourseApproval(client));
  } finally {
    await client.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error("Course approval schema repair failed:", error.message);
    process.exitCode = 1;
  });
}