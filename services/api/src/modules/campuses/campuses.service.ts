import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../../common/audit.service";
import { assertScope, assertScopeForRead, filterScopedRows } from "../../common/access-scope";
import type { AuthenticatedUser } from "../../common/request-context";
import { paginationMeta } from "../../common/pagination";
import type { ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type { CreateCampusDto, UpdateCampusDto } from "./campus.dto";

@Injectable()
export class CampusesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async list(institutionId: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number) {
    assertScopeForRead(user, institutionId);
    const tenantId = user.tenantId;
    const [rows, total] = await Promise.all([
      this.db.query(
        `SELECT id, tenant_id, institution_id, name, address, city, state, country, timezone, status, created_at, updated_at
         FROM campuses WHERE tenant_id = $1 AND institution_id = $2
         ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
        [tenantId, institutionId, pageSize, offset],
      ),
      this.db.query<{ count: string }>("SELECT count(*)::text AS count FROM campuses WHERE tenant_id = $1 AND institution_id = $2", [tenantId, institutionId]),
    ]);
    const visible = filterScopedRows(user, rows.rows as Array<Record<string, unknown>>, "institution_id", "id");
    return { data: visible, meta: paginationMeta(page, pageSize, visible.length) };
  }

  async get(id: string, user: AuthenticatedUser) {
    const tenantId = user.tenantId;
    const result = await this.db.query(
      "SELECT id, tenant_id, institution_id, name, address, city, state, country, timezone, status, created_at, updated_at FROM campuses WHERE id = $1 AND tenant_id = $2",
      [id, tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("Campus not found.");
    assertScopeForRead(user, result.rows[0].institution_id, id);
    return result.rows[0];
  }

  async create(input: CreateCampusDto, request: ContextRequest) {
    const tenantId = request.context.user!.tenantId;
    assertScope(request.context.user!, input.institutionId);
    const institution = await this.db.query<{ id: string }>("SELECT id FROM institutions WHERE id = $1 AND tenant_id = $2", [input.institutionId, tenantId]);
    if (!institution.rows[0]) throw new NotFoundException("Institution not found in the current tenant.");
    const result = await this.db.query(
      `INSERT INTO campuses (tenant_id, institution_id, name, address, city, state, country, timezone, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'IN'), COALESCE($8, 'Asia/Kolkata'), $9, $9)
       RETURNING id, tenant_id, institution_id, name, address, city, state, country, timezone, status, created_at, updated_at`,
      [tenantId, input.institutionId, input.name.trim(), input.address?.trim() || null, input.city?.trim() || null, input.state?.trim() || null, input.country?.trim() || null, input.timezone?.trim() || null, request.context.user!.id],
    );
    const campus = result.rows[0];
    await this.audit.record({ tenantId, institutionId: input.institutionId, campusId: campus.id, actorUserId: request.context.user!.id, requestId: request.context.requestId, module: "platform", resource: "campus", resourceId: campus.id, action: "CREATE", newValue: campus, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
    return campus;
  }

  async update(id: string, input: UpdateCampusDto, request: ContextRequest) {
    const user = request.context.user!;
    const tenantId = user.tenantId;
    const before = await this.get(id, user);
    assertScope(user, before.institution_id, id);
    const result = await this.db.query(
      `UPDATE campuses SET name = COALESCE($2, name), status = COALESCE($3, status), address = COALESCE($4, address),
         city = COALESCE($5, city), state = COALESCE($6, state), country = COALESCE($7, country),
         timezone = COALESCE($8, timezone), updated_by = $9, updated_at = now()
       WHERE id = $1 AND tenant_id = $10
       RETURNING id, tenant_id, institution_id, name, address, city, state, country, timezone, status, created_at, updated_at`,
      [id, input.name?.trim() || null, input.status ?? null, input.address?.trim() || null, input.city?.trim() || null, input.state?.trim() || null, input.country?.trim() || null, input.timezone?.trim() || null, request.context.user!.id, tenantId],
    );
    const campus = result.rows[0];
    await this.audit.record({ tenantId, institutionId: campus.institution_id, campusId: id, actorUserId: request.context.user!.id, requestId: request.context.requestId, module: "platform", resource: "campus", resourceId: id, action: "UPDATE", previousValue: before, newValue: campus, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
    return campus;
  }
}