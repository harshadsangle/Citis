import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolve } from "node:path";

const migration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/001_foundation.sql"), "utf8");

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