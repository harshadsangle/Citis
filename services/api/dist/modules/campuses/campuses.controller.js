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
exports.CampusesController = void 0;
const common_1 = require("@nestjs/common");
const pagination_1 = require("../../common/pagination");
const response_1 = require("../../common/response");
const permission_decorator_1 = require("../../guards/permission.decorator");
const permission_guard_1 = require("../../guards/permission.guard");
const auth_guard_1 = require("../auth/auth.guard");
const campus_dto_1 = require("./campus.dto");
const campuses_service_1 = require("./campuses.service");
let CampusesController = class CampusesController {
    campuses;
    constructor(campuses) {
        this.campuses = campuses;
    }
    async list(institutionId, request) {
        const pagination = (0, pagination_1.paginationFrom)(request);
        const result = await this.campuses.list(institutionId, request.context.user, pagination.page, pagination.pageSize, pagination.offset);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async get(id, request) {
        return (0, response_1.successResponse)(await this.campuses.get(id, request.context.user), request);
    }
    async create(input, request) {
        return (0, response_1.successResponse)(await this.campuses.create(input, request), request);
    }
    async update(id, input, request) {
        return (0, response_1.successResponse)(await this.campuses.update(id, input, request), request);
    }
};
exports.CampusesController = CampusesController;
__decorate([
    (0, common_1.Get)(),
    (0, permission_decorator_1.RequirePermission)("platform.institution.view"),
    __param(0, (0, common_1.Query)("institutionId")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampusesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, permission_decorator_1.RequirePermission)("platform.institution.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampusesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, permission_decorator_1.RequirePermission)("platform.institution.update"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [campus_dto_1.CreateCampusDto, Object]),
    __metadata("design:returntype", Promise)
], CampusesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, permission_decorator_1.RequirePermission)("platform.institution.update"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, campus_dto_1.UpdateCampusDto, Object]),
    __metadata("design:returntype", Promise)
], CampusesController.prototype, "update", null);
exports.CampusesController = CampusesController = __decorate([
    (0, common_1.Controller)("campuses"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [campuses_service_1.CampusesService])
], CampusesController);
//# sourceMappingURL=campuses.controller.js.map