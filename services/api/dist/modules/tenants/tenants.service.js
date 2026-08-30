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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const audit_service_1 = require("../../common/audit.service");
const pagination_1 = require("../../common/pagination");
const PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000001";
let TenantsService = class TenantsService {
    db;
    audit;
    constructor(db, audit) {
        this.db = db;
        this.audit = audit;
    }
    scopedTenantId(user, requested) {
        return user.roles.some((role) => role.code === "CITIS_SUPER_ADMIN" || role.code === "CITIS_PLATFORM_SUPPORT")
            ? requested
            : user.tenantId;
    }
    async list(user, page, pageSize, offset) {
        const scope = this.scopedTenantId(user);
        const values = [];
        const where = scope ? "WHERE t.id = $1" : "";
        if (scope)
            values.push(scope);
        const [rows, total] = await Promise.all([
            this.db.query(`SELECT t.id, t.name, t.slug, t.status, t.created_at, t.updated_at FROM tenants t ${where} ORDER BY t.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, pageSize, offset]),
            this.db.query(`SELECT count(*)::text AS count FROM tenants t ${where}`, values),
        ]);
        return { data: rows.rows, meta: (0, pagination_1.paginationMeta)(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
    }
    async get(id, user) {
        const scope = this.scopedTenantId(user, id);
        const result = await this.db.query("SELECT id, name, slug, status, created_at, updated_at FROM tenants WHERE id = $1", [scope]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("Tenant not found.");
        return result.rows[0];
    }
    async create(input, request) {
        const slug = input.slug?.trim() || input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        return this.db.transaction(async (client) => {
            const result = await client.query("INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id, name, slug, status, created_at, updated_at", [input.name.trim(), slug]);
            const tenant = result.rows[0];
            await client.query(`INSERT INTO roles (tenant_id, name, code, description)
         SELECT $1, name, code, description FROM roles
         WHERE tenant_id = $2 AND code NOT IN ('CITIS_SUPER_ADMIN', 'CITIS_PLATFORM_SUPPORT')
         ON CONFLICT (tenant_id, code) DO NOTHING`, [tenant.id, PLATFORM_TENANT_ID]);
            await client.query(`INSERT INTO tenant_modules (tenant_id, module_id, status)
         SELECT $1, id, 'INACTIVE' FROM modules ON CONFLICT (tenant_id, module_id) DO NOTHING`, [tenant.id]);
            await this.audit.record({
                tenantId: request.context.user?.tenantId ?? PLATFORM_TENANT_ID,
                actorUserId: request.context.user?.id,
                requestId: request.context.requestId,
                module: "platform",
                resource: "tenant",
                resourceId: tenant.id,
                action: "CREATE",
                newValue: tenant,
                ipAddress: request.context.ipAddress,
                deviceContext: { userAgent: request.context.userAgent },
            });
            return tenant;
        });
    }
    async update(id, input, request) {
        const before = await this.get(id, request.context.user);
        const result = await this.db.query(`UPDATE tenants SET name = COALESCE($2, name), status = COALESCE($3, status), updated_at = now()
       WHERE id = $1 RETURNING id, name, slug, status, created_at, updated_at`, [id, input.name?.trim() || null, input.status ?? null]);
        const tenant = result.rows[0];
        await this.audit.record({
            tenantId: request.context.user?.tenantId ?? PLATFORM_TENANT_ID,
            actorUserId: request.context.user?.id,
            requestId: request.context.requestId,
            module: "platform",
            resource: "tenant",
            resourceId: id,
            action: "UPDATE",
            previousValue: before,
            newValue: tenant,
            ipAddress: request.context.ipAddress,
            deviceContext: { userAgent: request.context.userAgent },
        });
        return tenant;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        audit_service_1.AuditService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map