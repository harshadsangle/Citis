import assert from "node:assert/strict";
import test from "node:test";
import { ForbiddenException } from "@nestjs/common";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { RbacService } from "./rbac.service";

const tenantAdmin: AuthenticatedUser = {
  id: "tenant-admin-1",
  tenantId: "tenant-1",
  email: "admin@example.com",
  firstName: "Institution",
  lastName: "Admin",
  roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
  permissions: ["lms.instructor_assignment.create"],
  scopes: [{ institutionId: "institution-1", campusId: null }],
};

function requestFor(user: AuthenticatedUser) {
  return {
    context: {
      requestId: "request-1",
      ipAddress: "127.0.0.1",
      userAgent: "test",
      user,
    },
  } as unknown as ContextRequest;
}

test("tenant role managers cannot assign platform permission codes", async () => {
  const queries: string[] = [];
  let transactionCalls = 0;
  const db = {
    query: async (text: string) => {
      queries.push(text);
      if (text.startsWith("SELECT id FROM roles")) return { rows: [{ id: "role-1" }] };
      if (text.startsWith("SELECT code FROM permissions")) return { rows: [{ code: "platform.user.manage" }] };
      throw new Error(`Unexpected query: ${text}`);
    },
    transaction: async () => {
      transactionCalls += 1;
      return undefined;
    },
  };
  const service = new RbacService(db as never, { record: async () => undefined } as never);

  await assert.rejects(
    service.assignPermissions("role-1", { permissionIds: ["permission-platform"] }, requestFor(tenantAdmin)),
    (error: unknown) => error instanceof ForbiddenException && error.getStatus() === 403,
  );
  assert.ok(queries.some((query) => query.startsWith("SELECT code FROM permissions")));
  assert.equal(transactionCalls, 0);
});

test("platform-level actors retain permission assignment access", async () => {
  const transactionQueries: string[] = [];
  const platformAdmin = {
    ...tenantAdmin,
    roles: [{ code: "CITIS_ADMIN", name: "CITIS Admin" }],
  };
  const db = {
    query: async (text: string) => {
      if (text.startsWith("SELECT id FROM roles")) return { rows: [{ id: "role-1" }] };
      if (text.startsWith("SELECT code FROM permissions")) return { rows: [{ code: "platform.user.manage" }] };
      throw new Error(`Unexpected query: ${text}`);
    },
    transaction: async (operation: (client: { query: (text: string) => Promise<{ rows: unknown[] }> }) => Promise<unknown>) =>
      operation({
        query: async (text: string) => {
          transactionQueries.push(text);
          return { rows: [] };
        },
      }),
  };
  const service = new RbacService(db as never, { record: async () => undefined } as never);

  const result = await service.assignPermissions(
    "role-1",
    { permissionIds: ["permission-platform"] },
    requestFor(platformAdmin),
  );

  assert.deepEqual(result, { roleId: "role-1", permissionIds: ["permission-platform"] });
  assert.equal(transactionQueries.length, 2);
});