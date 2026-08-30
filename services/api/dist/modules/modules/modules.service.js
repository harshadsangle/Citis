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
exports.ModulesService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../../common/audit.service");
const database_service_1 = require("../../database/database.service");
let ModulesService = class ModulesService {
    db;
    audit;
    constructor(db, audit) {
        this.db = db;
        this.audit = audit;
    }
    listCatalog() {
        return this.db.query("SELECT id, code, name, description, status, created_at, updated_at FROM modules ORDER BY name");
    }
    listForTenant(tenantId) {
        return this.db.query(`SELECT tm.id, tm.tenant_id, tm.module_id, m.code, m.name, m.description, tm.status,
              tm.activated_at, tm.expires_at, tm.created_at, tm.updated_at
       FROM tenant_modules tm JOIN modules m ON m.id = tm.module_id
       WHERE tm.tenant_id = $1 ORDER BY m.name`, [tenantId]);
    }
    async activate(input, request) {
        const tenantId = request.context.user.tenantId;
        const module = await this.db.query("SELECT id FROM modules WHERE id = $1 AND status = 'ACTIVE'", [input.moduleId]);
        if (!module.rows[0])
            throw new common_1.NotFoundException("Module not found.");
        const result = await this.db.query(`INSERT INTO tenant_modules (tenant_id, module_id, status, activated_at, expires_at, created_by, updated_by)
       VALUES ($1, $2, $3, CASE WHEN $3 = 'ACTIVE' THEN now() ELSE NULL END, $4, $5, $5)
       ON CONFLICT (tenant_id, module_id) DO UPDATE SET status = EXCLUDED.status,
         activated_at = CASE WHEN EXCLUDED.status = 'ACTIVE' THEN COALESCE(tenant_modules.activated_at, now()) ELSE tenant_modules.activated_at END,
         expires_at = EXCLUDED.expires_at, updated_by = EXCLUDED.updated_by, updated_at = now()
       RETURNING id, tenant_id, module_id, status, activated_at, expires_at, created_at, updated_at`, [tenantId, input.moduleId, input.status, input.expiresAt ? new Date(input.expiresAt) : null, request.context.user.id]);
        const activation = result.rows[0];
        await this.audit.record({ tenantId, actorUserId: request.context.user.id, requestId: request.context.requestId, module: "platform", resource: "tenant_module", resourceId: activation.id, action: "UPDATE", newValue: activation, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
        return activation;
    }
};
exports.ModulesService = ModulesService;
exports.ModulesService = ModulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        audit_service_1.AuditService])
], ModulesService);
//# sourceMappingURL=modules.service.js.map