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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let AuditService = class AuditService {
    db;
    constructor(db) {
        this.db = db;
    }
    async record(input) {
        await this.db.query(`INSERT INTO audit_logs
        (tenant_id, institution_id, campus_id, actor_user_id, request_id, module, resource,
         resource_id, action, previous_value, new_value, ip_address, device_context)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13::jsonb)`, [
            input.tenantId,
            input.institutionId ?? null,
            input.campusId ?? null,
            input.actorUserId ?? null,
            input.requestId,
            input.module,
            input.resource,
            input.resourceId ?? null,
            input.action,
            input.previousValue === undefined ? null : JSON.stringify(input.previousValue),
            input.newValue === undefined ? null : JSON.stringify(input.newValue),
            input.ipAddress ?? null,
            input.deviceContext === undefined ? null : JSON.stringify(input.deviceContext),
        ]);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AuditService);
//# sourceMappingURL=audit.service.js.map