import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolve } from "node:path";

const migration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/001_foundation.sql"), "utf8");
const lmsMigration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/002_lms_course_management.sql"), "utf8");
const relationshipMigration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/004_lms_enrollment_assignments.sql"), "utf8");
const progressMigration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/005_lms_progress_tracking.sql"), "utf8");
const assignmentMigration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/006_lms_assignments.sql"), "utf8");
const scopeMigration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/007_lms_scope_isolation.sql"), "utf8");

for (const table of ["tenants", "institutions", "campuses", "users", "roles", "permissions", "user_roles", "role_permissions", "modules", "tenant_modules", "audit_logs", "auth_sessions"]) {
  test(`migration defines ${table}`, () => {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  });
}

test("migration defines tenant-scoped foreign keys and supported permission actions", () => {
    assert.match(migration, /tenant_id uuid NOT NULL REFERENCES tenants\(id\)/);
    assert.match(migration, /'APPROVE', 'REJECT', 'EXPORT', 'PUBLISH', 'ARCHIVE'/);
    assert.match(migration, /INSERT INTO schema_migrations \(version\)/);
});

for (const table of ["programmes", "courses", "course_modules", "lessons", "learning_resources"]) {
  test(`LMS migration defines ${table}`, () => {
    assert.match(lmsMigration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  });
}

test("LMS migration defines hierarchy constraints and resource validation", () => {
  assert.match(lmsMigration, /UNIQUE \(tenant_id, institution_id, code\)/);
  assert.match(lmsMigration, /UNIQUE \(tenant_id, programme_id, code\)/);
  assert.match(lmsMigration, /UNIQUE \(course_id, sequence\)/);
  assert.match(lmsMigration, /UNIQUE \(module_id, sequence\)/);
  assert.match(lmsMigration, /UNIQUE \(lesson_id, sequence\)/);
  assert.match(lmsMigration, /resource_type IN \('VIDEO', 'PDF', 'DOCUMENT', 'PRESENTATION', 'LINK', 'SCORM', 'INTERACTIVE'\)/);
  assert.match(lmsMigration, /INSERT INTO schema_migrations \(version\)/);
});

for (const table of ["lms_enrollments", "lms_instructor_assignments"]) {
  test(`relationship migration defines ${table}`, () => {
    assert.match(relationshipMigration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  });
}

test("relationship migration defines active uniqueness and LMS permissions", () => {
  assert.match(relationshipMigration, /WHERE status = 'ACTIVE'/);
  assert.match(relationshipMigration, /lms\.enrollment\.create/);
  assert.match(relationshipMigration, /lms\.instructor_assignment\.create/);
  assert.match(relationshipMigration, /INSERT INTO schema_migrations \(version\)/);
});

for (const table of ["lms_assessments", "lms_lesson_progress", "lms_assessment_completions"]) {
  test(`progress migration defines ${table}`, () => {
    assert.match(progressMigration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  });
}

test("progress migration defines completion uniqueness, lifecycle rules, and learner permissions", () => {
  assert.match(progressMigration, /UNIQUE \(tenant_id, course_id, lesson_id, learner_id\)/);
  assert.match(progressMigration, /UNIQUE \(tenant_id, assessment_id, learner_id, attempt_id\)/);
  assert.match(progressMigration, /status IN \('IN_PROGRESS', 'COMPLETED'\)/);
  assert.match(progressMigration, /lms\.course_progress\.view/);
  assert.match(progressMigration, /lms\.assessment_completion\.create/);
  assert.match(progressMigration, /INSERT INTO schema_migrations \(version\)/);
});

test("assignment migration extends Blueprint assessments and defines isolated submissions", () => {
  assert.match(assignmentMigration, /ALTER TABLE lms_assessments/);
  assert.match(assignmentMigration, /ADD COLUMN IF NOT EXISTS instructions/);
  assert.match(assignmentMigration, /CREATE TABLE IF NOT EXISTS lms_assignment_submissions\b/);
  assert.match(assignmentMigration, /UNIQUE \(tenant_id, assignment_id, learner_id\)/);
  assert.match(assignmentMigration, /status IN \('SUBMITTED', 'GRADED'\)/);
  assert.match(assignmentMigration, /lms\.assignment_submission\.update/);
  assert.match(assignmentMigration, /INSERT INTO schema_migrations \(version\)/);
});

test("scope migration adds campus ancestry and composite integrity constraints", () => {
  assert.match(scopeMigration, /ADD COLUMN IF NOT EXISTS campus_id uuid/);
  assert.match(scopeMigration, /ADD COLUMN IF NOT EXISTS institution_id uuid/);
  assert.match(scopeMigration, /user_roles_scope_campus_fk/);
  assert.match(scopeMigration, /lms_enrollments_course_scope_fk/);
  assert.match(scopeMigration, /lms_enrollments_exact_course_campus_fk/);
  assert.match(scopeMigration, /lms_assessments_exact_course_campus_fk/);
  assert.match(scopeMigration, /lms_assignment_submissions_assignment_scope_fk/);
  assert.match(scopeMigration, /user_roles_campus_requires_institution_ck/);
  assert.match(scopeMigration, /INSERT INTO schema_migrations \(version\)/);
});