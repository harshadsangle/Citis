"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
describe("foundation migration contract", () => {
    const migration = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "packages/database/migrations/001_foundation.sql"), "utf8");
    it.each(["tenants", "institutions", "campuses", "users", "roles", "permissions", "user_roles", "role_permissions", "modules", "tenant_modules", "audit_logs", "auth_sessions"])("defines %s", (table) => {
        expect(migration).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
    });
    it("defines tenant-scoped foreign keys and the supported permission actions", () => {
        expect(migration).toContain("tenant_id uuid NOT NULL REFERENCES tenants(id)");
        expect(migration).toContain("'APPROVE', 'REJECT', 'EXPORT', 'PUBLISH', 'ARCHIVE'");
        expect(migration).toContain("INSERT INTO schema_migrations (version)");
    });
});
//# sourceMappingURL=migration.spec.js.map