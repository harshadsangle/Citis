import assert from "node:assert/strict";
import test from "node:test";
import { Reflector } from "@nestjs/core";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { PermissionGuard } from "./permission.guard";
import { REQUIRED_PERMISSION } from "./permission.decorator";

const reflector = new Reflector();
const guard = new PermissionGuard(reflector);

function context(
  user: { roles: Array<{ code: string; name: string }>; permissions: string[] },
  permission = "identity.user.view",
) {
    const handler = () => undefined;
    Reflect.defineMetadata(REQUIRED_PERMISSION, permission, handler);
    return {
      getHandler: () => handler,
      getClass: () => class TestController {},
      switchToHttp: () => ({ getRequest: () => ({ context: { user } }) }),
    } as unknown as ExecutionContext;
}

test("permission guard allows database-resolved permissions", () => {
  assert.equal(guard.canActivate(context({ roles: [], permissions: ["identity.user.view"] })), true);
});

test("permission guard allows the platform super admin role", () => {
  assert.equal(guard.canActivate(context({ roles: [{ code: "CITIS_SUPER_ADMIN", name: "CITIS Super Admin" }], permissions: [] })), true);
});

test("permission guard allows platform administrator roles without stored permissions", () => {
  for (const code of ["CITIS_ADMIN", "CITIS_SUPER_ADMIN", "CITIS_PLATFORM_SUPPORT"]) {
    assert.equal(guard.canActivate(context({ roles: [{ code, name: code }], permissions: [] })), true);
  }
});

test("permission guard rejects institution-scoped administrators from global permissions", () => {
  for (const code of ["INSTITUTION_ADMINISTRATOR", "PRINCIPAL_DIRECTOR", "ACADEMIC_ADMINISTRATOR"]) {
    assert.throws(
      () => guard.canActivate(context({
        roles: [{ code, name: code }],
        permissions: ["identity.user.view", "platform.module.view", "audit.audit_log.view"],
      })),
      ForbiddenException,
    );
  }
});

test("permission guard preserves explicitly granted LMS permissions for institution administrators", () => {
  assert.equal(guard.canActivate(context({
    roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
    permissions: ["lms.course.view"],
  }, "lms.course.view")), true);
});

test("permission guard rejects missing permissions", () => {
  assert.throws(() => guard.canActivate(context({ roles: [], permissions: [] })), ForbiddenException);
});