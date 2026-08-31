"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacController = void 0;
const common_1 = require("@nestjs/common");
const response_1 = require("../../common/response");
const permission_decorator_1 = require("../../guards/permission.decorator");
const permission_guard_1 = require("../../guards/permission.guard");
const auth_guard_1 = require("../auth/auth.guard");
const rbac_dto_1 = require("./rbac.dto");
const rbac_service_1 = require("./rbac.service");
let RbacController = class RbacController {
    rbac;
    constructor(rbac) {
        this.rbac = rbac;
    }
    async roles(request) {
        const result = await this.rbac.listRoles(request.context.user.tenantId);
        return (0, response_1.successResponse)(result.rows, request);
    }
    async createRole(input, request) {
        return (0, response_1.successResponse)(await this.rbac.createRole(input, request), request);
    }
    async permissions(request) {
        const result = await this.rbac.listPermissions();
        return (0, response_1.successResponse)(result.rows, request);
    }
    async assignPermissions(roleId, input, request) {
        return (0, response_1.successResponse)(await this.rbac.assignPermissions(roleId, input, request), request);
    }
};
exports.RbacController = RbacController;
__decorate([
    (0, common_1.Get)("roles"),
    (0, permission_decorator_1.RequirePermission)("identity.role.view"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "roles", null);
__decorate([
    (0, common_1.Post)("roles"),
    (0, permission_decorator_1.RequirePermission)("identity.role.create"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rbac_dto_1.CreateRoleDto, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "createRole", null);
__decorate([
    (0, common_1.Get)("permissions"),
    (0, permission_decorator_1.RequirePermission)("identity.permission.view"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "permissions", null);
__decorate([
    (0, common_1.Post)("roles/:roleId/permissions"),
    (0, permission_decorator_1.RequirePermission)("identity.permission.update"),
    __param(0, (0, common_1.Param)("roleId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rbac_dto_1.AssignPermissionsDto, Object]),
    __metadata("design:returntype", Promise)
], RbacController.prototype, "assignPermissions", null);
exports.RbacController = RbacController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [rbac_service_1.RbacService])
], RbacController);
//# sourceMappingURL=rbac.controller.js.map