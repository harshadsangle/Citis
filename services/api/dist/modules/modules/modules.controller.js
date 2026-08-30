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
exports.ModulesController = void 0;
const common_1 = require("@nestjs/common");
const response_1 = require("../../common/response");
const permission_decorator_1 = require("../../guards/permission.decorator");
const permission_guard_1 = require("../../guards/permission.guard");
const auth_guard_1 = require("../auth/auth.guard");
const module_dto_1 = require("./module.dto");
const modules_service_1 = require("./modules.service");
let ModulesController = class ModulesController {
    modules;
    constructor(modules) {
        this.modules = modules;
    }
    async catalog(request) {
        return (0, response_1.successResponse)((await this.modules.listCatalog()).rows, request);
    }
    async tenantModules(request) {
        return (0, response_1.successResponse)((await this.modules.listForTenant(request.context.user.tenantId)).rows, request);
    }
    async activate(input, request) {
        return (0, response_1.successResponse)(await this.modules.activate(input, request), request);
    }
};
exports.ModulesController = ModulesController;
__decorate([
    (0, common_1.Get)("modules"),
    (0, permission_decorator_1.RequirePermission)("platform.module.view"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "catalog", null);
__decorate([
    (0, common_1.Get)("tenant-modules"),
    (0, permission_decorator_1.RequirePermission)("platform.module.view"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "tenantModules", null);
__decorate([
    (0, common_1.Post)("tenant-modules"),
    (0, permission_decorator_1.RequirePermission)("platform.module.update"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [module_dto_1.ActivateModuleDto, Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "activate", null);
exports.ModulesController = ModulesController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [modules_service_1.ModulesService])
], ModulesController);
//# sourceMappingURL=modules.controller.js.map