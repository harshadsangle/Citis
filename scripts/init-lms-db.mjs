import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";
import { repositoryRoot } from "./load-local-env.mjs";

const { Pool } = pg;
const migrationRoot = resolve(repositoryRoot, "packages/database/migrations");
const migrationVersions = [
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
];

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to initialize the LMS database.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  for (const version of migrationVersions) {
    const migration = await readFile(resolve(migrationRoot, `${version}.sql`), "utf8");
    await pool.query(migration);
    console.log(`Applied ${version}`);
  }
  console.log("LMS database schema is ready.");
} finally {
  await pool.end();
}