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
exports.InstitutionsService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../../common/audit.service");
const pagination_1 = require("../../common/pagination");
const database_service_1 = require("../../database/database.service");
const PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000001";
let InstitutionsService = class InstitutionsService {
    db;
    audit;
    constructor(db, audit) {
        this.db = db;
        this.audit = audit;
    }
    targetTenant(user, requested) {
        const platform = user.roles.some((role) => role.code === "CITIS_SUPER_ADMIN" || role.code === "CITIS_PLATFORM_SUPPORT");
        return platform ? requested ?? null : user.tenantId;
    }
    async list(user, page, pageSize, offset, tenantId) {
        const scope = this.targetTenant(user, tenantId);
        const values = [];
        const where = scope ? "WHERE i.tenant_id = $1" : "";
        if (scope)
            values.push(scope);
        const [rows, total] = await Promise.all([
            this.db.query(`SELECT i.id, i.tenant_id, i.name, i.slug, i.institution_type, i.logo_url, i.email, i.phone, i.website, i.status, i.created_at, i.updated_at
        FROM institutions i ${where} ORDER BY i.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, pageSize, offset]),
            this.db.query(`SELECT count(*)::text AS count FROM institutions i ${where}`, values),
        ]);
        return { data: rows.rows, meta: (0, pagination_1.paginationMeta)(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
    }
    async get(id, user) {
        const result = await this.db.query(`SELECT id, tenant_id, name, slug, institution_type, logo_url, email, phone, website, status, created_at, updated_at
       FROM institutions WHERE id = $1 AND ($2::uuid IS NULL OR tenant_id = $2)`, [id, this.targetTenant(user)]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("Institution not found.");
        return result.rows[0];
    }
    async create(input, request) {
        const user = request.context.user;
        const tenantId = this.targetTenant(user, input.tenantId) ?? input.tenantId;
        if (!tenantId)
            throw new common_1.NotFoundException("A tenant scope is required.");
        const slug = input.slug?.trim() || input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const result = await this.db.query(`INSERT INTO institutions (tenant_id, name, slug, institution_type, email, phone, website, created_by, updated_by)
       VALUES ($1, $2, $3, COALESCE($4, 'SCHOOL'), $5, $6, $7, $8, $8)
       RETURNING id, tenant_id, name, slug, institution_type, email, phone, website, status, created_at, updated_at`, [tenantId, input.name.trim(), slug, input.institutionType?.trim() || null, input.email?.trim() || null, input.phone?.trim() || null, input.website?.trim() || null, user.id]);
        const institution = result.rows[0];
        await this.audit.record({
            tenantId,
            institutionId: institution.id,
            actorUserId: user.id,
            requestId: request.context.requestId,
            module: "platform",
            resource: "institution",
            resourceId: institution.id,
            action: "CREATE",
            newValue: institution,
            ipAddress: request.context.ipAddress,
            deviceContext: { userAgent: request.context.userAgent },
        });
        return institution;
    }
    async update(id, input, request) {
        const before = await this.get(id, request.context.user);
        const result = await this.db.query(`UPDATE institutions
       SET name = COALESCE($2, name), status = COALESCE($3, status), email = COALESCE($4, email),
           phone = COALESCE($5, phone), website = COALESCE($6, website), updated_by = $7, updated_at = now()
       WHERE id = $1 RETURNING id, tenant_id, name, slug, institution_type, email, phone, website, status, created_at, updated_at`, [id, input.name?.trim() || null, input.status ?? null, input.email?.trim() || null, input.phone?.trim() || null, input.website?.trim() || null, request.context.user.id]);
        const institution = result.rows[0];
        await this.audit.record({
            tenantId: institution.tenant_id,
            institutionId: id,
            actorUserId: request.context.user.id,
            requestId: request.context.requestId,
            module: "platform",
            resource: "institution",
            resourceId: id,
            action: "UPDATE",
            previousValue: before,
            newValue: institution,
            ipAddress: request.context.ipAddress,
            deviceContext: { userAgent: request.context.userAgent },
        });
        return institution;
    }
};
exports.InstitutionsService = InstitutionsService;
exports.InstitutionsService = InstitutionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        audit_service_1.AuditService])
], InstitutionsService);
//# sourceMappingURL=institutions.service.js.map