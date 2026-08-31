"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const node_test_1 = __importDefault(require("node:test"));
const node_path_1 = require("node:path");
const migration = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "../../packages/database/migrations/001_foundation.sql"), "utf8");
const lmsMigration = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "../../packages/database/migrations/002_lms_course_management.sql"), "utf8");
const relationshipMigration = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "../../packages/database/migrations/004_lms_enrollment_assignments.sql"), "utf8");
const progressMigration = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "../../packages/database/migrations/005_lms_progress_tracking.sql"), "utf8");
const assignmentMigration = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "../../packages/database/migrations/006_lms_assignments.sql"), "utf8");
const scopeMigration = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "../../packages/database/migrations/007_lms_scope_isolation.sql"), "utf8");
const assessmentMigration = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "../../packages/database/migrations/008_lms_assessment_engine.sql"), "utf8");
const operationsMigration = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "../../packages/database/migrations/009_lms_assessment_operations.sql"), "utf8");
const gradingPermissionMigration = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "../../packages/database/migrations/010_lms_assessment_grading_permission.sql"), "utf8");
for (const table of ["tenants", "institutions", "campuses", "users", "roles", "permissions", "user_roles", "role_permissions", "modules", "tenant_modules", "audit_logs", "auth_sessions"]) {
    (0, node_test_1.default)(`migration defines ${table}`, () => {
        strict_1.default.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
    });
}
(0, node_test_1.default)("migration defines tenant-scoped foreign keys and supported permission actions", () => {
    strict_1.default.match(migration, /tenant_id uuid NOT NULL REFERENCES tenants\(id\)/);
    strict_1.default.match(migration, /'APPROVE', 'REJECT', 'EXPORT', 'PUBLISH', 'ARCHIVE'/);
    strict_1.default.match(migration, /INSERT INTO schema_migrations \(version\)/);
});
for (const table of ["programmes", "courses", "course_modules", "lessons", "learning_resources"]) {
    (0, node_test_1.default)(`LMS migration defines ${table}`, () => {
        strict_1.default.match(lmsMigration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
    });
}
(0, node_test_1.default)("LMS migration defines hierarchy constraints and resource validation", () => {
    strict_1.default.match(lmsMigration, /UNIQUE \(tenant_id, institution_id, code\)/);
    strict_1.default.match(lmsMigration, /UNIQUE \(tenant_id, programme_id, code\)/);
    strict_1.default.match(lmsMigration, /UNIQUE \(course_id, sequence\)/);
    strict_1.default.match(lmsMigration, /UNIQUE \(module_id, sequence\)/);
    strict_1.default.match(lmsMigration, /UNIQUE \(lesson_id, sequence\)/);
    strict_1.default.match(lmsMigration, /resource_type IN \('VIDEO', 'PDF', 'DOCUMENT', 'PRESENTATION', 'LINK', 'SCORM', 'INTERACTIVE'\)/);
    strict_1.default.match(lmsMigration, /INSERT INTO schema_migrations \(version\)/);
});
for (const table of ["lms_enrollments", "lms_instructor_assignments"]) {
    (0, node_test_1.default)(`relationship migration defines ${table}`, () => {
        strict_1.default.match(relationshipMigration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
    });
}
(0, node_test_1.default)("relationship migration defines active uniqueness and LMS permissions", () => {
    strict_1.default.match(relationshipMigration, /WHERE status = 'ACTIVE'/);
    strict_1.default.match(relationshipMigration, /lms\.enrollment\.create/);
    strict_1.default.match(relationshipMigration, /lms\.instructor_assignment\.create/);
    strict_1.default.match(relationshipMigration, /INSERT INTO schema_migrations \(version\)/);
});
for (const table of ["lms_assessments", "lms_lesson_progress", "lms_assessment_completions"]) {
    (0, node_test_1.default)(`progress migration defines ${table}`, () => {
        strict_1.default.match(progressMigration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
    });
}
(0, node_test_1.default)("progress migration defines completion uniqueness, lifecycle rules, and learner permissions", () => {
    strict_1.default.match(progressMigration, /UNIQUE \(tenant_id, course_id, lesson_id, learner_id\)/);
    strict_1.default.match(progressMigration, /UNIQUE \(tenant_id, assessment_id, learner_id, attempt_id\)/);
    strict_1.default.match(progressMigration, /status IN \('IN_PROGRESS', 'COMPLETED'\)/);
    strict_1.default.match(progressMigration, /lms\.course_progress\.view/);
    strict_1.default.match(progressMigration, /lms\.assessment_completion\.create/);
    strict_1.default.match(progressMigration, /INSERT INTO schema_migrations \(version\)/);
});
(0, node_test_1.default)("assignment migration extends Blueprint assessments and defines isolated submissions", () => {
    strict_1.default.match(assignmentMigration, /ALTER TABLE lms_assessments/);
    strict_1.default.match(assignmentMigration, /ADD COLUMN IF NOT EXISTS instructions/);
    strict_1.default.match(assignmentMigration, /CREATE TABLE IF NOT EXISTS lms_assignment_submissions\b/);
    strict_1.default.match(assignmentMigration, /UNIQUE \(tenant_id, assignment_id, learner_id\)/);
    strict_1.default.match(assignmentMigration, /status IN \('SUBMITTED', 'GRADED'\)/);
    strict_1.default.match(assignmentMigration, /lms\.assignment_submission\.update/);
    strict_1.default.match(assignmentMigration, /INSERT INTO schema_migrations \(version\)/);
});
(0, node_test_1.default)("scope migration adds campus ancestry and composite integrity constraints", () => {
    strict_1.default.match(scopeMigration, /ADD COLUMN IF NOT EXISTS campus_id uuid/);
    strict_1.default.match(scopeMigration, /ADD COLUMN IF NOT EXISTS institution_id uuid/);
    strict_1.default.match(scopeMigration, /user_roles_scope_campus_fk/);
    strict_1.default.match(scopeMigration, /lms_enrollments_course_scope_fk/);
    strict_1.default.match(scopeMigration, /lms_enrollments_exact_course_campus_fk/);
    strict_1.default.match(scopeMigration, /lms_assessments_exact_course_campus_fk/);
    strict_1.default.match(scopeMigration, /lms_assignment_submissions_assignment_scope_fk/);
    strict_1.default.match(scopeMigration, /user_roles_campus_requires_institution_ck/);
    strict_1.default.match(scopeMigration, /INSERT INTO schema_migrations \(version\)/);
});
(0, node_test_1.default)("assessment migration defines isolated questions, options, attempts, and immutable answers", () => {
    for (const table of ["lms_assessment_questions", "lms_assessment_options", "lms_assessment_attempts", "lms_assessment_answers"]) {
        strict_1.default.match(assessmentMigration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
    }
    strict_1.default.match(assessmentMigration, /question_type IN \('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_TEXT', 'NUMERIC'\)/);
    strict_1.default.match(assessmentMigration, /status IN \('IN_PROGRESS', 'SUBMITTED'\)/);
    strict_1.default.match(assessmentMigration, /lms_assessment_questions_assessment_scope_fk/);
    strict_1.default.match(assessmentMigration, /lms_assessment_answers_attempt_scope_fk/);
    strict_1.default.match(assessmentMigration, /lms\.assessment_attempt\.create/);
    strict_1.default.match(assessmentMigration, /lms\.assessment_option\.update/);
    strict_1.default.match(assessmentMigration, /INSERT INTO schema_migrations \(version\)/);
});
(0, node_test_1.default)("assessment operations migration defines manual grading and review permissions", () => {
    strict_1.default.match(operationsMigration, /ADD COLUMN IF NOT EXISTS grading_status/);
    strict_1.default.match(operationsMigration, /grading_status IN \('NOT_REQUIRED', 'PENDING', 'GRADED'\)/);
    strict_1.default.match(operationsMigration, /ADD COLUMN IF NOT EXISTS grader_id/);
    strict_1.default.match(operationsMigration, /lms\.assessment_attempt\.update/);
    strict_1.default.match(operationsMigration, /INSERT INTO schema_migrations \(version\)/);
});
(0, node_test_1.default)("assessment grading permission migration backfills existing staff roles", () => {
    strict_1.default.match(gradingPermissionMigration, /lms\.assessment_attempt\.update/);
    strict_1.default.match(gradingPermissionMigration, /010_lms_assessment_grading_permission/);
});
//# sourceMappingURL=migration.spec.js.map