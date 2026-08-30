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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const pagination_1 = require("../../common/pagination");
const response_1 = require("../../common/response");
const permission_decorator_1 = require("../../guards/permission.decorator");
const permission_guard_1 = require("../../guards/permission.guard");
const auth_guard_1 = require("../auth/auth.guard");
const database_service_1 = require("../../database/database.service");
let AuditController = class AuditController {
    db;
    constructor(db) {
        this.db = db;
    }
    async list(request, resource) {
        const pagination = (0, pagination_1.paginationFrom)(request);
        const result = await this.db.query(`SELECT id, tenant_id, institution_id, campus_id, actor_user_id, request_id, module, resource,
              resource_id, action, previous_value, new_value, ip_address, device_context, created_at
       FROM audit_logs
       WHERE tenant_id = $1 AND ($2::text IS NULL OR resource = $2)
       ORDER BY created_at DESC LIMIT $3 OFFSET $4`, [request.context.user.tenantId, resource?.trim() || null, pagination.pageSize, pagination.offset]);
        const total = await this.db.query("SELECT count(*)::text AS count FROM audit_logs WHERE tenant_id = $1 AND ($2::text IS NULL OR resource = $2)", [request.context.user.tenantId, resource?.trim() || null]);
        return (0, response_1.paginatedResponse)(result.rows, (0, pagination_1.paginationMeta)(pagination.page, pagination.pageSize, Number(total.rows[0]?.count ?? 0)), request);
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    (0, permission_decorator_1.RequirePermission)("audit.audit_log.view"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("resource")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "list", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)("audit-logs"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map