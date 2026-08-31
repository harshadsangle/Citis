import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import { AuditService } from "../../common/audit.service";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { paginationMeta } from "../../common/pagination";
import type { CreateTenantDto, UpdateTenantDto } from "./tenant.dto";

const PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000001";

@Injectable()
export class TenantsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private scopedTenantId(user: AuthenticatedUser, requested?: string) {
    return user.roles.some((role) => role.code === "CITIS_SUPER_ADMIN" || role.code === "CITIS_PLATFORM_SUPPORT")
      ? requested
      : user.tenantId;
  }

  async list(user: AuthenticatedUser, page: number, pageSize: number, offset: number) {
    const scope = this.scopedTenantId(user);
    const values: unknown[] = [];
    const where = scope ? "WHERE t.id = $1" : "";
    if (scope) values.push(scope);
    const [rows, total] = await Promise.all([
      this.db.query(`SELECT t.id, t.name, t.slug, t.status, t.created_at, t.updated_at FROM tenants t ${where} ORDER BY t.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, pageSize, offset]),
      this.db.query<{ count: string }>(`SELECT count(*)::text AS count FROM tenants t ${where}`, values),
    ]);
    return { data: rows.rows, meta: paginationMeta(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
  }

  async get(id: string, user: AuthenticatedUser) {
    const scope = this.scopedTenantId(user, id);
    const result = await this.db.query("SELECT id, name, slug, status, created_at, updated_at FROM tenants WHERE id = $1", [scope]);
    if (!result.rows[0]) throw new NotFoundException("Tenant not found.");
    return result.rows[0];
  }

  async create(input: CreateTenantDto, request: ContextRequest) {
    const slug = input.slug?.trim() || input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return this.db.transaction(async (client) => {
      const result = await client.query(
        "INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id, name, slug, status, created_at, updated_at",
        [input.name.trim(), slug],
      );
      const tenant = result.rows[0];
      await client.query(
        `INSERT INTO roles (tenant_id, name, code, description)
         SELECT $1, name, code, description FROM roles
         WHERE tenant_id = $2 AND code NOT IN ('CITIS_SUPER_ADMIN', 'CITIS_PLATFORM_SUPPORT')
         ON CONFLICT (tenant_id, code) DO NOTHING`,
        [tenant.id, PLATFORM_TENANT_ID],
      );
      await client.query(
        `INSERT INTO tenant_modules (tenant_id, module_id, status)
         SELECT $1, id, 'INACTIVE' FROM modules ON CONFLICT (tenant_id, module_id) DO NOTHING`,
        [tenant.id],
      );
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

  async update(id: string, input: UpdateTenantDto, request: ContextRequest) {
    const before = await this.get(id, request.context.user!);
    const result = await this.db.query(
      `UPDATE tenants SET name = COALESCE($2, name), status = COALESCE($3, status), updated_at = now()
       WHERE id = $1 RETURNING id, name, slug, status, created_at, updated_at`,
      [id, input.name?.trim() || null, input.status ?? null],
    );
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
}