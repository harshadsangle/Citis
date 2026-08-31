import assert from "node:assert/strict";
import test from "node:test";
import { Reflector } from "@nestjs/core";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { PermissionGuard } from "./permission.guard";
import { REQUIRED_PERMISSION } from "./permission.decorator";

const reflector = new Reflector();
const guard = new PermissionGuard(reflector);

function context(user: { roles: Array<{ code: string; name: string }>; permissions: string[] }) {
    const handler = () => undefined;
    Reflect.defineMetadata(REQUIRED_PERMISSION, "identity.user.view", handler);
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

test("permission guard rejects missing permissions", () => {
  assert.throws(() => guard.canActivate(context({ roles: [], permissions: [] })), ForbiddenException);
});