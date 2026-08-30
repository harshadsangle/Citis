"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const permission_guard_1 = require("./permission.guard");
const permission_decorator_1 = require("./permission.decorator");
describe("PermissionGuard", () => {
    const reflector = new core_1.Reflector();
    const guard = new permission_guard_1.PermissionGuard(reflector);
    function context(user) {
        const handler = () => undefined;
        Reflect.defineMetadata(permission_decorator_1.REQUIRED_PERMISSION, "identity.user.view", handler);
        return {
            getHandler: () => handler,
            getClass: () => class TestController {
            },
            switchToHttp: () => ({ getRequest: () => ({ context: { user } }) }),
        };
    }
    it("allows a permission resolved from the database-backed principal", () => {
        expect(guard.canActivate(context({ roles: [], permissions: ["identity.user.view"] }))).toBe(true);
    });
    it("allows the platform super admin role", () => {
        expect(guard.canActivate(context({ roles: [{ code: "CITIS_SUPER_ADMIN", name: "CITIS Super Admin" }], permissions: [] }))).toBe(true);
    });
    it("rejects missing permissions", () => {
        expect(() => guard.canActivate(context({ roles: [], permissions: [] }))).toThrow(common_1.ForbiddenException);
    });
});
//# sourceMappingURL=permission.guard.spec.js.map