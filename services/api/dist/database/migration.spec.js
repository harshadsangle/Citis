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
//# sourceMappingURL=migration.spec.js.map