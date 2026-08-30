import { Reflector } from "@nestjs/core";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { PermissionGuard } from "./permission.guard";
import { REQUIRED_PERMISSION } from "./permission.decorator";

describe("PermissionGuard", () => {
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

  it("allows a permission resolved from the database-backed principal", () => {
    expect(guard.canActivate(context({ roles: [], permissions: ["identity.user.view"] }))).toBe(true);
  });

  it("allows the platform super admin role", () => {
    expect(guard.canActivate(context({ roles: [{ code: "CITIS_SUPER_ADMIN", name: "CITIS Super Admin" }], permissions: [] }))).toBe(true);
  });

  it("rejects missing permissions", () => {
    expect(() => guard.canActivate(context({ roles: [], permissions: [] }))).toThrow(ForbiddenException);
  });
});