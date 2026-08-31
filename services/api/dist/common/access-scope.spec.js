"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const common_1 = require("@nestjs/common");
const access_scope_1 = require("./access-scope");
const campusUser = {
    id: "campus-user",
    tenantId: "tenant-1",
    email: "campus@example.com",
    firstName: "Campus",
    lastName: "User",
    roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
    permissions: [],
    scopes: [{ institutionId: "institution-1", campusId: "campus-1" }],
};
const institutionUser = {
    ...campusUser,
    id: "institution-user",
    scopes: [{ institutionId: "institution-1", campusId: null }],
};
(0, node_test_1.default)("campus scope permits its campus and institution-wide content only", () => {
    strict_1.default.equal((0, access_scope_1.canAccessScope)(campusUser, "institution-1", "campus-1"), true);
    strict_1.default.equal((0, access_scope_1.canAccessScope)(campusUser, "institution-1", null), true);
    strict_1.default.equal((0, access_scope_1.canAccessScope)(campusUser, "institution-1", "campus-2"), false);
    strict_1.default.equal((0, access_scope_1.canAccessScope)(campusUser, "institution-2", "campus-1"), false);
});
(0, node_test_1.default)("institution scope covers every campus without crossing institutions", () => {
    strict_1.default.equal((0, access_scope_1.canAccessScope)(institutionUser, "institution-1", "campus-1"), true);
    strict_1.default.equal((0, access_scope_1.canAccessScope)(institutionUser, "institution-1", "campus-2"), true);
    strict_1.default.equal((0, access_scope_1.canAccessScope)(institutionUser, "institution-2", null), false);
});
(0, node_test_1.default)("scope failures use write and read-safe exceptions", () => {
    strict_1.default.throws(() => (0, access_scope_1.assertScope)(campusUser, "institution-2"), common_1.ForbiddenException);
    strict_1.default.throws(() => (0, access_scope_1.assertScopeForRead)(campusUser, "institution-2"), common_1.NotFoundException);
});
(0, node_test_1.default)("platform super admin is unrestricted", () => {
    const platformUser = { ...campusUser, roles: [{ code: "CITIS_SUPER_ADMIN", name: "CITIS Super Admin" }], scopes: [] };
    strict_1.default.equal((0, access_scope_1.canAccessScope)(platformUser, "institution-2", "campus-9"), true);
});
//# sourceMappingURL=access-scope.spec.js.map