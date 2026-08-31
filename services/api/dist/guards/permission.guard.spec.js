"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const permission_guard_1 = require("./permission.guard");
const permission_decorator_1 = require("./permission.decorator");
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
(0, node_test_1.default)("permission guard allows database-resolved permissions", () => {
    strict_1.default.equal(guard.canActivate(context({ roles: [], permissions: ["identity.user.view"] })), true);
});
(0, node_test_1.default)("permission guard allows the platform super admin role", () => {
    strict_1.default.equal(guard.canActivate(context({ roles: [{ code: "CITIS_SUPER_ADMIN", name: "CITIS Super Admin" }], permissions: [] })), true);
});
(0, node_test_1.default)("permission guard rejects missing permissions", () => {
    strict_1.default.throws(() => guard.canActivate(context({ roles: [], permissions: [] })), common_1.ForbiddenException);
});
//# sourceMappingURL=permission.guard.spec.js.map