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
const assessmentMigration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/008_lms_assessment_engine.sql"), "utf8");
const operationsMigration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/009_lms_assessment_operations.sql"), "utf8");
const gradingPermissionMigration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/010_lms_assessment_grading_permission.sql"), "utf8");
const attemptStabilityMigration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/011_lms_assessment_attempt_stability.sql"), "utf8");
const instructorDashboardMigration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/012_lms_instructor_dashboard_access.sql"), "utf8");

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

test("assessment migration defines isolated questions, options, attempts, and immutable answers", () => {
  for (const table of ["lms_assessment_questions", "lms_assessment_options", "lms_assessment_attempts", "lms_assessment_answers"]) {
    assert.match(assessmentMigration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  }
  assert.match(assessmentMigration, /question_type IN \('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_TEXT', 'NUMERIC'\)/);
  assert.match(assessmentMigration, /status IN \('IN_PROGRESS', 'SUBMITTED'\)/);
  assert.match(assessmentMigration, /lms_assessment_questions_assessment_scope_fk/);
  assert.match(assessmentMigration, /lms_assessment_answers_attempt_scope_fk/);
  assert.match(assessmentMigration, /lms\.assessment_attempt\.create/);
  assert.match(assessmentMigration, /lms\.assessment_option\.update/);
  assert.match(assessmentMigration, /INSERT INTO schema_migrations \(version\)/);
});

test("assessment operations migration defines manual grading and review permissions", () => {
  assert.match(operationsMigration, /ADD COLUMN IF NOT EXISTS grading_status/);
  assert.match(operationsMigration, /grading_status IN \('NOT_REQUIRED', 'PENDING', 'GRADED'\)/);
  assert.match(operationsMigration, /ADD COLUMN IF NOT EXISTS grader_id/);
  assert.match(operationsMigration, /lms\.assessment_attempt\.update/);
  assert.match(operationsMigration, /INSERT INTO schema_migrations \(version\)/);
});

test("assessment grading permission migration backfills existing staff roles", () => {
  assert.match(gradingPermissionMigration, /lms\.assessment_attempt\.update/);
  assert.match(gradingPermissionMigration, /010_lms_assessment_grading_permission/);
});

test("assessment attempt stability migration snapshots content, enforces expiry, and stores drafts", () => {
  assert.match(attemptStabilityMigration, /question_snapshot jsonb/);
  assert.match(attemptStabilityMigration, /expires_at timestamptz/);
  assert.match(attemptStabilityMigration, /CREATE TABLE IF NOT EXISTS lms_assessment_attempt_drafts/);
  assert.match(attemptStabilityMigration, /status IN \('IN_PROGRESS', 'SUBMITTED', 'EXPIRED'\)/);
  assert.match(attemptStabilityMigration, /INSERT INTO schema_migrations \(version\)/);
});

test("instructor dashboard migration grants read-only course and roster access", () => {
  assert.match(instructorDashboardMigration, /r\.code = 'TEACHER'/);
  assert.match(instructorDashboardMigration, /lms\.course\.view/);
  assert.match(instructorDashboardMigration, /lms\.enrollment\.view/);
  assert.match(instructorDashboardMigration, /012_lms_instructor_dashboard_access/);
});