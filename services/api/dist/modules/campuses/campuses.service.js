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
exports.CampusesService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../../common/audit.service");
const access_scope_1 = require("../../common/access-scope");
const pagination_1 = require("../../common/pagination");
const database_service_1 = require("../../database/database.service");
let CampusesService = class CampusesService {
    db;
    audit;
    constructor(db, audit) {
        this.db = db;
        this.audit = audit;
    }
    async list(institutionId, user, page, pageSize, offset) {
        (0, access_scope_1.assertScopeForRead)(user, institutionId);
        const tenantId = user.tenantId;
        const [rows, total] = await Promise.all([
            this.db.query(`SELECT id, tenant_id, institution_id, name, address, city, state, country, timezone, status, created_at, updated_at
         FROM campuses WHERE tenant_id = $1 AND institution_id = $2
         ORDER BY created_at DESC LIMIT $3 OFFSET $4`, [tenantId, institutionId, pageSize, offset]),
            this.db.query("SELECT count(*)::text AS count FROM campuses WHERE tenant_id = $1 AND institution_id = $2", [tenantId, institutionId]),
        ]);
        const visible = (0, access_scope_1.filterScopedRows)(user, rows.rows);
        return { data: visible, meta: (0, pagination_1.paginationMeta)(page, pageSize, visible.length) };
    }
    async get(id, user) {
        const tenantId = user.tenantId;
        const result = await this.db.query("SELECT id, tenant_id, institution_id, name, address, city, state, country, timezone, status, created_at, updated_at FROM campuses WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("Campus not found.");
        (0, access_scope_1.assertScopeForRead)(user, result.rows[0].institution_id);
        return result.rows[0];
    }
    async create(input, request) {
        const tenantId = request.context.user.tenantId;
        (0, access_scope_1.assertScope)(request.context.user, input.institutionId);
        const institution = await this.db.query("SELECT id FROM institutions WHERE id = $1 AND tenant_id = $2", [input.institutionId, tenantId]);
        if (!institution.rows[0])
            throw new common_1.NotFoundException("Institution not found in the current tenant.");
        const result = await this.db.query(`INSERT INTO campuses (tenant_id, institution_id, name, address, city, state, country, timezone, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'IN'), COALESCE($8, 'Asia/Kolkata'), $9, $9)
       RETURNING id, tenant_id, institution_id, name, address, city, state, country, timezone, status, created_at, updated_at`, [tenantId, input.institutionId, input.name.trim(), input.address?.trim() || null, input.city?.trim() || null, input.state?.trim() || null, input.country?.trim() || null, input.timezone?.trim() || null, request.context.user.id]);
        const campus = result.rows[0];
        await this.audit.record({ tenantId, institutionId: input.institutionId, campusId: campus.id, actorUserId: request.context.user.id, requestId: request.context.requestId, module: "platform", resource: "campus", resourceId: campus.id, action: "CREATE", newValue: campus, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
        return campus;
    }
    async update(id, input, request) {
        const tenantId = request.context.user.tenantId;
        const before = await this.get(id, tenantId);
        (0, access_scope_1.assertScope)(request.context.user, before.institution_id);
        const result = await this.db.query(`UPDATE campuses SET name = COALESCE($2, name), status = COALESCE($3, status), address = COALESCE($4, address),
         city = COALESCE($5, city), state = COALESCE($6, state), country = COALESCE($7, country),
         timezone = COALESCE($8, timezone), updated_by = $9, updated_at = now()
       WHERE id = $1 AND tenant_id = $10
       RETURNING id, tenant_id, institution_id, name, address, city, state, country, timezone, status, created_at, updated_at`, [id, input.name?.trim() || null, input.status ?? null, input.address?.trim() || null, input.city?.trim() || null, input.state?.trim() || null, input.country?.trim() || null, input.timezone?.trim() || null, request.context.user.id, tenantId]);
        const campus = result.rows[0];
        await this.audit.record({ tenantId, institutionId: campus.institution_id, campusId: id, actorUserId: request.context.user.id, requestId: request.context.requestId, module: "platform", resource: "campus", resourceId: id, action: "UPDATE", previousValue: before, newValue: campus, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
        return campus;
    }
};
exports.CampusesService = CampusesService;
exports.CampusesService = CampusesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        audit_service_1.AuditService])
], CampusesService);
//# sourceMappingURL=campuses.service.js.map