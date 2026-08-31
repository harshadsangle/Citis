import assert from "node:assert/strict";
import test from "node:test";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { assertScope, assertScopeForRead, canAccessScope } from "./access-scope";
import type { AuthenticatedUser } from "./request-context";

const campusUser: AuthenticatedUser = {
  id: "campus-user",
  tenantId: "tenant-1",
  email: "campus@example.com",
  firstName: "Campus",
  lastName: "User",
  roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
  permissions: [],
  scopes: [{ institutionId: "institution-1", campusId: "campus-1" }],
};

const institutionUser: AuthenticatedUser = {
  ...campusUser,
  id: "institution-user",
  scopes: [{ institutionId: "institution-1", campusId: null }],
};

test("campus scope permits its campus and institution-wide content only", () => {
  assert.equal(canAccessScope(campusUser, "institution-1", "campus-1"), true);
  assert.equal(canAccessScope(campusUser, "institution-1", null), true);
  assert.equal(canAccessScope(campusUser, "institution-1", "campus-2"), false);
  assert.equal(canAccessScope(campusUser, "institution-2", "campus-1"), false);
});

test("institution scope covers every campus without crossing institutions", () => {
  assert.equal(canAccessScope(institutionUser, "institution-1", "campus-1"), true);
  assert.equal(canAccessScope(institutionUser, "institution-1", "campus-2"), true);
  assert.equal(canAccessScope(institutionUser, "institution-2", null), false);
});

test("scope failures use write and read-safe exceptions", () => {
  assert.throws(() => assertScope(campusUser, "institution-2"), ForbiddenException);
  assert.throws(() => assertScopeForRead(campusUser, "institution-2"), NotFoundException);
});

test("platform super admin is unrestricted", () => {
  const platformUser = { ...campusUser, roles: [{ code: "CITIS_SUPER_ADMIN", name: "CITIS Super Admin" }], scopes: [] };
  assert.equal(canAccessScope(platformUser, "institution-2", "campus-9"), true);
});