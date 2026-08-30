import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../../common/audit.service";
import type { ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type { AssignPermissionsDto, CreateRoleDto } from "./rbac.dto";

@Injectable()
export class RbacService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  listRoles(tenantId: string) {
    return this.db.query("SELECT id, tenant_id, name, code, description, status, created_at, updated_at FROM roles WHERE tenant_id = $1 ORDER BY name", [tenantId]);
  }

  listPermissions() {
    return this.db.query("SELECT id, module, resource, action, code, description FROM permissions ORDER BY module, resource, action");
  }

  async createRole(input: CreateRoleDto, request: ContextRequest) {
    const tenantId = request.context.user!.tenantId;
    const result = await this.db.query(
      "INSERT INTO roles (tenant_id, name, code, description) VALUES ($1, $2, $3, $4) RETURNING id, tenant_id, name, code, description, status, created_at, updated_at",
      [tenantId, input.name.trim(), input.code.trim().toUpperCase(), input.description?.trim() || null],
    );
    const role = result.rows[0];
    await this.audit.record({ tenantId, actorUserId: request.context.user!.id, requestId: request.context.requestId, module: "identity", resource: "role", resourceId: role.id, action: "CREATE", newValue: role, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
    return role;
  }

  async assignPermissions(roleId: string, input: AssignPermissionsDto, request: ContextRequest) {
    const tenantId = request.context.user!.tenantId;
    const role = await this.db.query<{ id: string }>("SELECT id FROM roles WHERE id = $1 AND tenant_id = $2", [roleId, tenantId]);
    if (!role.rows[0]) throw new NotFoundException("Role not found.");
    await this.db.transaction(async (client) => {
      await client.query("DELETE FROM role_permissions WHERE role_id = $1", [roleId]);
      for (const permissionId of input.permissionIds) {
        await client.query("INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [roleId, permissionId]);
      }
    });
    await this.audit.record({ tenantId, actorUserId: request.context.user!.id, requestId: request.context.requestId, module: "identity", resource: "role_permission", resourceId: roleId, action: "UPDATE", newValue: { permissionIds: input.permissionIds }, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
    return { roleId, permissionIds: input.permissionIds };
  }
}