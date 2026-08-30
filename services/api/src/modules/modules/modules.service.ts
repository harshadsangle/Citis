import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../../common/audit.service";
import type { ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type { ActivateModuleDto } from "./module.dto";

@Injectable()
export class ModulesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  listCatalog() {
    return this.db.query("SELECT id, code, name, description, status, created_at, updated_at FROM modules ORDER BY name");
  }

  listForTenant(tenantId: string) {
    return this.db.query(
      `SELECT tm.id, tm.tenant_id, tm.module_id, m.code, m.name, m.description, tm.status,
              tm.activated_at, tm.expires_at, tm.created_at, tm.updated_at
       FROM tenant_modules tm JOIN modules m ON m.id = tm.module_id
       WHERE tm.tenant_id = $1 ORDER BY m.name`,
      [tenantId],
    );
  }

  async activate(input: ActivateModuleDto, request: ContextRequest) {
    const tenantId = request.context.user!.tenantId;
    const module = await this.db.query<{ id: string }>("SELECT id FROM modules WHERE id = $1 AND status = 'ACTIVE'", [input.moduleId]);
    if (!module.rows[0]) throw new NotFoundException("Module not found.");
    const result = await this.db.query(
      `INSERT INTO tenant_modules (tenant_id, module_id, status, activated_at, expires_at, created_by, updated_by)
       VALUES ($1, $2, $3, CASE WHEN $3 = 'ACTIVE' THEN now() ELSE NULL END, $4, $5, $5)
       ON CONFLICT (tenant_id, module_id) DO UPDATE SET status = EXCLUDED.status,
         activated_at = CASE WHEN EXCLUDED.status = 'ACTIVE' THEN COALESCE(tenant_modules.activated_at, now()) ELSE tenant_modules.activated_at END,
         expires_at = EXCLUDED.expires_at, updated_by = EXCLUDED.updated_by, updated_at = now()
       RETURNING id, tenant_id, module_id, status, activated_at, expires_at, created_at, updated_at`,
      [tenantId, input.moduleId, input.status, input.expiresAt ? new Date(input.expiresAt) : null, request.context.user!.id],
    );
    const activation = result.rows[0];
    await this.audit.record({ tenantId, actorUserId: request.context.user!.id, requestId: request.context.requestId, module: "platform", resource: "tenant_module", resourceId: activation.id, action: "UPDATE", newValue: activation, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
    return activation;
  }
}