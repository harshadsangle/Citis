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

test("pending staff registrations without institution scope inherit only a tenant's sole institution", async () => {
  const calls: Array<{ sql: string; values?: unknown[] }> = [];
  const db = {
    query: async (sql: string, values?: unknown[]) => {
      calls.push({ sql, values });
      return sql.startsWith("SELECT count(*)::text AS count FROM users u")
        ? { rows: [{ count: "0" }] }
        : { rows: [] };
    },
  };
  const service = new UsersService(db as never, {} as never);
  const actor = {
    id: "admin-1",
    tenantId: "tenant-1",
    email: "admin@example.test",
    firstName: "Admin",
    lastName: "User",
    roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
    permissions: [],
    scopes: [{ institutionId: "institution-1", campusId: null }],
  };

  await service.list(actor, 1, 100, 0, undefined, "PENDING", "TEACHER,INSTITUTION_ADMINISTRATOR");

  const rowsQuery = calls.find((call) => call.sql.includes("SELECT u.id"));
  assert.ok(rowsQuery);
  assert.match(rowsQuery.sql, /u\.tenant_id = \$1/);
  assert.match(rowsQuery.sql, /actor_scope\.user_id = \$2/);
  assert.match(rowsQuery.sql, /pending_request_scope\.institution_id IS NULL/);
  assert.match(rowsQuery.sql, /pending_request_scope\.campus_id IS NULL/);
  assert.match(rowsQuery.sql, /pending_request_role\.code IN \('TEACHER', 'INSTRUCTOR', 'INSTITUTION_ADMINISTRATOR'\)/);
  assert.match(rowsQuery.sql, /u\.status = 'PENDING'/);
  assert.match(rowsQuery.sql, /count\(\*\)[\s\S]*?tenant_institution\.tenant_id = u\.tenant_id[\s\S]*?\) = 1/);
  assert.match(rowsQuery.sql, /actor_registration_scope\.user_id = \$2/);
  assert.match(rowsQuery.sql, /actor_registration_scope\.tenant_id = u\.tenant_id/);
  assert.match(rowsQuery.sql, /other_tenant_institution\.id <> actor_registration_scope\.institution_id/);
  assert.match(rowsQuery.sql, /u\.status = \$3/);
  assert.match(rowsQuery.sql, /filter_role\.code = ANY\(\$4::text\[\]\)/);
  assert.deepEqual(rowsQuery.values, [
    "tenant-1",
    "admin-1",
    "PENDING",
    ["TEACHER", "INSTITUTION_ADMINISTRATOR"],
    100,
    0,
  ]);
});

test("unscoped pending registration visibility is not added to ordinary user or learner lists", async () => {
  const queries: string[] = [];
  const db = {
    query: async (sql: string) => {
      queries.push(sql);
      return sql.startsWith("SELECT count(*)::text AS count FROM users u") ? { rows: [{ count: "0" }] } : { rows: [] };
    },
  };
  const service = new UsersService(db as never, {} as never);
  const actor = {
    id: "admin-1",
    tenantId: "tenant-1",
    email: "admin@example.test",
    firstName: "Admin",
    lastName: "User",
    roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
    permissions: [],
    scopes: [{ institutionId: "institution-1", campusId: null }],
  };

  await service.list(actor, 1, 100, 0);
  await service.list(actor, 1, 100, 0, undefined, "PENDING", "STUDENT");

  const rowsQueries = queries.filter((sql) => sql.includes("SELECT u.id"));
  assert.equal(rowsQueries.length, 2);
  assert.equal(rowsQueries.some((sql) => sql.includes("pending_request_scope")), false);
});

test("approving an instructor request assigns institution scope and activates the account atomically", async () => {
  const calls: Array<{ sql: string; values?: unknown[] }> = [];
  const client = {
    query: async <T>(sql: string, values?: unknown[]) => {
      calls.push({ sql, values });
      let rows: unknown[] = [];
      if (sql.includes("FROM users u")) {
        rows = [{
          id: "instructor-1",
          tenant_id: "tenant-1",
          role_id: "teacher-role",
          role_code: "TEACHER",
          user_role_id: "user-role-1",
        }];
      } else if (sql.includes("FROM institutions\n")) {
        rows = [{ id: "institution-1" }];
      } else if (sql.includes("FROM institutions i")) {
        rows = [{ id: "institution-1", campus_id: "campus-1" }];
      } else if (sql.includes("SELECT id FROM user_roles")) {
        rows = [];
      } else if (sql.startsWith("UPDATE user_roles")) {
        rows = [{ id: "user-role-1" }];
      } else if (sql.startsWith("UPDATE users")) {
        rows = [{
          id: "instructor-1",
          tenant_id: "tenant-1",
          email: "instructor@example.test",
          first_name: "New",
          last_name: "Teacher",
          status: "ACTIVE",
        }];
      }
      return { rows: rows as T[] };
    },
  };
  const db = { transaction: async (work: (connection: never) => Promise<unknown>) => work(client as never) };
  const auditEvents: unknown[] = [];
  const service = new UsersService(db as never, { record: async (event: unknown) => auditEvents.push(event) } as never);
  const actor = {
    id: "admin-1",
    tenantId: "tenant-1",
    email: "admin@example.test",
    firstName: "Admin",
    lastName: "User",
    roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
    permissions: [],
    scopes: [{ institutionId: "institution-1", campusId: null }],
  };

  const result = await service.approveInstructorRequest(
    "instructor-1",
    { institutionId: "institution-1", campusId: "campus-1" },
    { context: { user: actor, requestId: "request-1", ipAddress: "127.0.0.1", userAgent: "test" } } as never,
  );

  assert.equal(result.status, "ACTIVE");
  assert.equal(calls.some(({ sql }) => sql.startsWith("UPDATE user_roles")), true);
  assert.equal(calls.some(({ sql }) => sql.startsWith("UPDATE users") && sql.includes("status = 'ACTIVE'")), true);
  assert.deepEqual(auditEvents[0], {
    tenantId: "tenant-1",
    institutionId: "institution-1",
    campusId: "campus-1",
    actorUserId: "admin-1",
    requestId: "request-1",
    module: "identity",
    resource: "instructor_request",
    resourceId: "instructor-1",
    action: "APPROVE",
    previousValue: { status: "PENDING" },
    newValue: {
      status: "ACTIVE",
      roleCode: "TEACHER",
      institutionId: "institution-1",
      campusId: "campus-1",
    },
    ipAddress: "127.0.0.1",
    deviceContext: { userAgent: "test" },
  });
});

test("rejecting an instructor request disables the account and records the reason", async () => {
  const calls: string[] = [];
  const client = {
    query: async <T>(sql: string) => {
      calls.push(sql);
      if (sql.includes("FROM users u")) {
        return { rows: [{ id: "instructor-1", tenant_id: "tenant-1", role_code: "INSTRUCTOR" }] as T[] };
      }
      if (sql.startsWith("UPDATE users")) {
        return {
          rows: [{
            id: "instructor-1",
            tenant_id: "tenant-1",
            email: "instructor@example.test",
            first_name: "New",
            last_name: "Teacher",
            status: "DISABLED",
          }] as T[],
        };
      }
      return { rows: [] as T[] };
    },
  };
  const db = { transaction: async (work: (connection: never) => Promise<unknown>) => work(client as never) };
  const auditEvents: Array<{ newValue?: { reason?: string } }> = [];
  const service = new UsersService(db as never, { record: async (event: { newValue?: { reason?: string } }) => auditEvents.push(event) } as never);
  const actor = {
    id: "admin-1",
    tenantId: "tenant-1",
    email: "admin@example.test",
    firstName: "Admin",
    lastName: "User",
    roles: [{ code: "CITIS_SUPER_ADMIN", name: "CITIS Super Admin" }],
    permissions: [],
    scopes: [],
  };

  const result = await service.rejectInstructorRequest(
    "instructor-1",
    { reason: "  Incomplete application.  " },
    { context: { user: actor, requestId: "request-2" } } as never,
  );

  assert.equal(result.status, "DISABLED");
  assert.equal(calls.some((sql) => sql.includes("status = 'DISABLED'")), true);
  assert.equal(auditEvents[0]?.newValue?.reason, "Incomplete application.");
});

test("institution administrators cannot act on unscoped requests when the tenant has multiple institutions", async () => {
  const calls: string[] = [];
  const client = {
    query: async <T>(sql: string) => {
      calls.push(sql);
      if (sql.includes("FROM users u")) {
        return {
          rows: [{ id: "instructor-1", tenant_id: "tenant-1", role_code: "TEACHER" }] as T[],
        };
      }
      if (sql.includes("FROM institutions\n")) {
        return { rows: [{ id: "institution-1" }, { id: "institution-2" }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };
  const db = { transaction: async (work: (connection: never) => Promise<unknown>) => work(client as never) };
  const service = new UsersService(db as never, { record: async () => undefined } as never);
  const actor = {
    id: "admin-1",
    tenantId: "tenant-1",
    email: "admin@example.test",
    firstName: "Admin",
    lastName: "User",
    roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
    permissions: [],
    scopes: [{ institutionId: "institution-1", campusId: null }],
  };

  await assert.rejects(
    service.rejectInstructorRequest(
      "instructor-1",
      { reason: "Incomplete application." },
      { context: { user: actor, requestId: "request-3" } } as never,
    ),
    /Pending instructor request not found/,
  );
  assert.equal(calls.some((sql) => sql.startsWith("UPDATE users")), false);
});