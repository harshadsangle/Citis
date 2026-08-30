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
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const response_1 = require("../../common/response");
const pagination_1 = require("../../common/pagination");
const auth_guard_1 = require("../auth/auth.guard");
const permission_guard_1 = require("../../guards/permission.guard");
const permission_decorator_1 = require("../../guards/permission.decorator");
const tenant_dto_1 = require("./tenant.dto");
const tenants_service_1 = require("./tenants.service");
let TenantsController = class TenantsController {
    tenants;
    constructor(tenants) {
        this.tenants = tenants;
    }
    async list(request) {
        const pagination = (0, pagination_1.paginationFrom)(request);
        const result = await this.tenants.list(request.context.user, pagination.page, pagination.pageSize, pagination.offset);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async get(id, request) {
        return (0, response_1.successResponse)(await this.tenants.get(id, request.context.user), request);
    }
    async create(input, request) {
        return (0, response_1.successResponse)(await this.tenants.create(input, request), request);
    }
    async update(id, input, request) {
        return (0, response_1.successResponse)(await this.tenants.update(id, input, request), request);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Get)(),
    (0, permission_decorator_1.RequirePermission)("platform.tenant.view"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, permission_decorator_1.RequirePermission)("platform.tenant.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, permission_decorator_1.RequirePermission)("platform.tenant.create"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tenant_dto_1.CreateTenantDto, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, permission_decorator_1.RequirePermission)("platform.tenant.update"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tenant_dto_1.UpdateTenantDto, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "update", null);
exports.TenantsController = TenantsController = __decorate([
    (0, common_1.Controller)("tenants"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map