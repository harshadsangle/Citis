import assert from "node:assert/strict";
import test from "node:test";
import { UsersService } from "./users.service";

test("user listings include active scoped role assignments", async () => {
  const db = {
    query: async (sql: string) => {
      if (sql.includes("count(*)")) return { rows: [{ count: "1" }] };
      return {
        rows: [{
          id: "user-1",
          tenant_id: "tenant-1",
          email: "instructor@example.test",
          status: "ACTIVE",
          roles: [{
            id: "role-1",
            code: "TEACHER",
            name: "Teacher",
            institution_id: "institution-1",
            campus_id: "campus-1",
          }],
        }],
      };
    },
  };
  const service = new UsersService(db as never, {} as never);
  const result = await service.list({
    id: "admin-1",
    tenantId: "tenant-1",
    email: "admin@example.test",
    firstName: "Admin",
    lastName: "User",
    roles: [{ code: "CITIS_SUPER_ADMIN", name: "CITIS Super Admin" }],
    permissions: [],
    scopes: [],
  }, 1, 50, 0);

  assert.equal(result.data[0]?.roles?.[0]?.code, "TEACHER");
  assert.equal(result.data[0]?.roles?.[0]?.institution_id, "institution-1");
  assert.equal(result.data[0]?.roles?.[0]?.campus_id, "campus-1");
});