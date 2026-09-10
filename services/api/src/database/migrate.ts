import "reflect-metadata";
import "../config/load-env";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "pg";

export const MIGRATION_VERSIONS = [
  "001_foundation",
  "002_lms_course_management",
  "003_lms_managed_resources",
  "004_lms_enrollment_assignments",
  "005_lms_progress_tracking",
  "006_lms_assignments",
  "007_lms_scope_isolation",
  "008_lms_assessment_engine",
  "009_lms_assessment_operations",
  "010_lms_assessment_grading_permission",
  "011_lms_assessment_attempt_stability",
  "012_lms_instructor_dashboard_access",
  "013_lms_certificates",
  "014_auth_account_recovery_registration",
  "015_lms_teacher_content_management",
  "016_lms_admin_full_access",
  "017_auth_email_sms_mfa",
  "018_lms_resource_progress",
  "019_lms_resource_progress_permission",
  "020_lms_foundation_roles_profiles",
  "021_college_student_csv_onboarding",
  "022_direct_student_registration_otp",
  "023_razorpay_course_payments",
  "024_lms_progress_assessment_assignment_integrity",
  "025_lms_certificate_lifecycle",
  "026_lms_tenant_parent_integrity",
] as const;

const MIGRATION_LOCK_ID = 728431;

export function migrationChecksum(sql: string) {
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

export async function resolveMigrationRoot() {
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
  return migrationRoot;
}

export interface MigrationRunResult {
  applied: string[];
  skipped: string[];
  checksumsBackfilled: string[];
}

export async function runMigrations(
  client: Client,
  migrationRoot: string,
  versions: readonly string[] = MIGRATION_VERSIONS,
  log: (message: string) => void = console.log,
): Promise<MigrationRunResult> {
  await client.query("SELECT pg_advisory_lock($1::bigint)", [MIGRATION_LOCK_ID]);
  try {
    // These runner-owned tables are idempotent and preserve the existing
    // schema_migrations rows while adding checksum metadata separately.
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migration_checksums (
        version text PRIMARY KEY,
        checksum text NOT NULL,
        recorded_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const migrationFiles = await Promise.all(versions.map(async (version) => {
      const sql = await readFile(resolve(migrationRoot, `${version}.sql`), "utf8");
      return { version, sql, checksum: migrationChecksum(sql) };
    }));
    const appliedRows = await client.query<{ version: string }>("SELECT version FROM schema_migrations");
    const appliedVersions = new Set(appliedRows.rows.map((row) => row.version));
    const checksumRows = await client.query<{ version: string; checksum: string }>(
      "SELECT version, checksum FROM schema_migration_checksums",
    );
    const storedChecksums = new Map(checksumRows.rows.map((row) => [row.version, row.checksum]));

    for (const migration of migrationFiles) {
      const storedChecksum = storedChecksums.get(migration.version);
      if (storedChecksum && storedChecksum !== migration.checksum) {
        throw new Error(
          `Migration checksum mismatch for ${migration.version}: stored ${storedChecksum}, current ${migration.checksum}.`,
        );
      }
    }

    const checksumsBackfilled = migrationFiles
      .filter(({ version }) => appliedVersions.has(version) && !storedChecksums.has(version))
      .map(({ version }) => version);
    if (checksumsBackfilled.length > 0) {
      await client.query("BEGIN");
      try {
        for (const migration of migrationFiles) {
          if (!checksumsBackfilled.includes(migration.version)) continue;
          await client.query(
            `INSERT INTO schema_migration_checksums (version, checksum)
             VALUES ($1, $2)
             ON CONFLICT (version) DO NOTHING`,
            [migration.version, migration.checksum],
          );
        }
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    const applied: string[] = [];
    const skipped: string[] = [];
    for (const migration of migrationFiles) {
      if (appliedVersions.has(migration.version)) {
        skipped.push(migration.version);
        continue;
      }

      await client.query("BEGIN");
      try {
        await client.query(migration.sql);
        await client.query(
          `INSERT INTO schema_migrations (version)
           VALUES ($1)
           ON CONFLICT (version) DO NOTHING`,
          [migration.version],
        );
        await client.query(
          `INSERT INTO schema_migration_checksums (version, checksum)
           VALUES ($1, $2)
           ON CONFLICT (version) DO UPDATE SET checksum = EXCLUDED.checksum`,
          [migration.version, migration.checksum],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(
          `Migration ${migration.version} failed: ${error instanceof Error ? error.message : String(error)}`,
          { cause: error },
        );
      }
      appliedVersions.add(migration.version);
      applied.push(migration.version);
      log(`Applied ${migration.version}`);
    }

    return { applied, skipped, checksumsBackfilled };
  } finally {
    await client.query("SELECT pg_advisory_unlock($1::bigint)", [MIGRATION_LOCK_ID]);
  }
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await runMigrations(client, await resolveMigrationRoot());
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Database migration failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}