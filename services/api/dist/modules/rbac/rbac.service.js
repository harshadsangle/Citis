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
exports.RbacService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../../common/audit.service");
const database_service_1 = require("../../database/database.service");
let RbacService = class RbacService {
    db;
    audit;
    constructor(db, audit) {
        this.db = db;
        this.audit = audit;
    }
    listRoles(tenantId) {
        return this.db.query("SELECT id, tenant_id, name, code, description, status, created_at, updated_at FROM roles WHERE tenant_id = $1 ORDER BY name", [tenantId]);
    }
    listPermissions() {
        return this.db.query("SELECT id, module, resource, action, code, description FROM permissions ORDER BY module, resource, action");
    }
    async createRole(input, request) {
        const tenantId = request.context.user.tenantId;
        const result = await this.db.query("INSERT INTO roles (tenant_id, name, code, description) VALUES ($1, $2, $3, $4) RETURNING id, tenant_id, name, code, description, status, created_at, updated_at", [tenantId, input.name.trim(), input.code.trim().toUpperCase(), input.description?.trim() || null]);
        const role = result.rows[0];
        await this.audit.record({ tenantId, actorUserId: request.context.user.id, requestId: request.context.requestId, module: "identity", resource: "role", resourceId: role.id, action: "CREATE", newValue: role, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
        return role;
    }
    async assignPermissions(roleId, input, request) {
        const tenantId = request.context.user.tenantId;
        const role = await this.db.query("SELECT id FROM roles WHERE id = $1 AND tenant_id = $2", [roleId, tenantId]);
        if (!role.rows[0])
            throw new common_1.NotFoundException("Role not found.");
        await this.db.transaction(async (client) => {
            await client.query("DELETE FROM role_permissions WHERE role_id = $1", [roleId]);
            for (const permissionId of input.permissionIds) {
                await client.query("INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [roleId, permissionId]);
            }
        });
        await this.audit.record({ tenantId, actorUserId: request.context.user.id, requestId: request.context.requestId, module: "identity", resource: "role_permission", resourceId: roleId, action: "UPDATE", newValue: { permissionIds: input.permissionIds }, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
        return { roleId, permissionIds: input.permissionIds };
    }
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        audit_service_1.AuditService])
], RbacService);
//# sourceMappingURL=rbac.service.js.map