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
exports.InstitutionsController = void 0;
const common_1 = require("@nestjs/common");
const pagination_1 = require("../../common/pagination");
const response_1 = require("../../common/response");
const permission_decorator_1 = require("../../guards/permission.decorator");
const permission_guard_1 = require("../../guards/permission.guard");
const auth_guard_1 = require("../auth/auth.guard");
const institution_dto_1 = require("./institution.dto");
const institutions_service_1 = require("./institutions.service");
let InstitutionsController = class InstitutionsController {
    institutions;
    constructor(institutions) {
        this.institutions = institutions;
    }
    async list(request, tenantId) {
        const pagination = (0, pagination_1.paginationFrom)(request);
        const result = await this.institutions.list(request.context.user, pagination.page, pagination.pageSize, pagination.offset, tenantId);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async get(id, request) {
        return (0, response_1.successResponse)(await this.institutions.get(id, request.context.user), request);
    }
    async create(input, request) {
        return (0, response_1.successResponse)(await this.institutions.create(input, request), request);
    }
    async update(id, input, request) {
        return (0, response_1.successResponse)(await this.institutions.update(id, input, request), request);
    }
};
exports.InstitutionsController = InstitutionsController;
__decorate([
    (0, common_1.Get)(),
    (0, permission_decorator_1.RequirePermission)("platform.institution.view"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("tenantId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, permission_decorator_1.RequirePermission)("platform.institution.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, permission_decorator_1.RequirePermission)("platform.institution.create"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [institution_dto_1.CreateInstitutionDto, Object]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, permission_decorator_1.RequirePermission)("platform.institution.update"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, institution_dto_1.UpdateInstitutionDto, Object]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "update", null);
exports.InstitutionsController = InstitutionsController = __decorate([
    (0, common_1.Controller)("institutions"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [institutions_service_1.InstitutionsService])
], InstitutionsController);
//# sourceMappingURL=institutions.controller.js.map