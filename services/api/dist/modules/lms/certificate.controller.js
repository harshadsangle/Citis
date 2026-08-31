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
exports.CertificateController = exports.PublicCertificateController = void 0;
const common_1 = require("@nestjs/common");
const pagination_1 = require("../../common/pagination");
const response_1 = require("../../common/response");
const permission_decorator_1 = require("../../guards/permission.decorator");
const permission_guard_1 = require("../../guards/permission.guard");
const auth_guard_1 = require("../auth/auth.guard");
const certificate_service_1 = require("./certificate.service");
const lms_dto_1 = require("./lms.dto");
let PublicCertificateController = class PublicCertificateController {
    certificates;
    constructor(certificates) {
        this.certificates = certificates;
    }
    async verify(identifier, request) {
        return (0, response_1.successResponse)(await this.certificates.verify(identifier, request.context.requestId), request);
    }
};
exports.PublicCertificateController = PublicCertificateController;
__decorate([
    (0, common_1.Get)("verify/:identifier"),
    __param(0, (0, common_1.Param)("identifier")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicCertificateController.prototype, "verify", null);
exports.PublicCertificateController = PublicCertificateController = __decorate([
    (0, common_1.Controller)("public/certificates"),
    __metadata("design:paramtypes", [certificate_service_1.CertificateService])
], PublicCertificateController);
let CertificateController = class CertificateController {
    certificates;
    constructor(certificates) {
        this.certificates = certificates;
    }
    async list(request, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.certificates.list(request.context.user, page.page, page.pageSize, page.offset, query);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async get(id, request) {
        return (0, response_1.successResponse)(await this.certificates.get(id, request.context.user), request);
    }
    async download(id, request, response) {
        const file = await this.certificates.download(id, request);
        response.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
        response.setHeader("Content-Disposition", `attachment; filename="${file.filename.replace(/[\r\n"]/g, "")}"`);
        response.setHeader("Cache-Control", "private, no-store");
        response.setHeader("X-Content-Type-Options", "nosniff");
        return response.send(file.content);
    }
};
exports.CertificateController = CertificateController;
__decorate([
    (0, common_1.Get)("certificates"),
    (0, permission_decorator_1.RequirePermission)("lms.certificate.view"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, lms_dto_1.CertificateListQueryDto]),
    __metadata("design:returntype", Promise)
], CertificateController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("certificates/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.certificate.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CertificateController.prototype, "get", null);
__decorate([
    (0, common_1.Get)("certificates/:id/download"),
    (0, permission_decorator_1.RequirePermission)("lms.certificate.export"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CertificateController.prototype, "download", null);
exports.CertificateController = CertificateController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [certificate_service_1.CertificateService])
], CertificateController);
//# sourceMappingURL=certificate.controller.js.map