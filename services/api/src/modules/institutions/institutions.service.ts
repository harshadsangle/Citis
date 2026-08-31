import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../../common/audit.service";
import { assertScope, assertScopeForRead, filterScopedRows, isPlatformUser } from "../../common/access-scope";
import { paginationMeta } from "../../common/pagination";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type { CreateInstitutionDto, UpdateInstitutionDto } from "./institution.dto";

const PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000001";

@Injectable()
export class InstitutionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private targetTenant(user: AuthenticatedUser, requested?: string) {
    const platform = isPlatformUser(user);
    return platform ? requested ?? null : user.tenantId;
  }

  async list(user: AuthenticatedUser, page: number, pageSize: number, offset: number, tenantId?: string) {
    const scope = this.targetTenant(user, tenantId);
    const values: unknown[] = [];
    const where = scope ? "WHERE i.tenant_id = $1" : "";
    if (scope) values.push(scope);
    const [rows, total] = await Promise.all([
      this.db.query(`SELECT i.id, i.tenant_id, i.name, i.slug, i.institution_type, i.logo_url, i.email, i.phone, i.website, i.status, i.created_at, i.updated_at
        FROM institutions i ${where} ORDER BY i.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, pageSize, offset]),
      this.db.query<{ count: string }>(`SELECT count(*)::text AS count FROM institutions i ${where}`, values),
    ]);
    const visible = filterScopedRows(user, rows.rows as Array<Record<string, unknown>>);
    return { data: visible, meta: paginationMeta(page, pageSize, visible.length) };
  }

  async get(id: string, user: AuthenticatedUser) {
    const result = await this.db.query(
      `SELECT id, tenant_id, name, slug, institution_type, logo_url, email, phone, website, status, created_at, updated_at
       FROM institutions WHERE id = $1 AND ($2::uuid IS NULL OR tenant_id = $2)`,
      [id, this.targetTenant(user)],
    );
    if (!result.rows[0]) throw new NotFoundException("Institution not found.");
    assertScopeForRead(user, id);
    return result.rows[0];
  }

  async create(input: CreateInstitutionDto, request: ContextRequest) {
    const user = request.context.user!;
    if (!isPlatformUser(user)) throw new NotFoundException("Institution creation is not available in the current scope.");
    const tenantId = this.targetTenant(user, input.tenantId) ?? input.tenantId;
    if (!tenantId) throw new NotFoundException("A tenant scope is required.");
    const slug = input.slug?.trim() || input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const result = await this.db.query(
      `INSERT INTO institutions (tenant_id, name, slug, institution_type, email, phone, website, created_by, updated_by)
       VALUES ($1, $2, $3, COALESCE($4, 'SCHOOL'), $5, $6, $7, $8, $8)
       RETURNING id, tenant_id, name, slug, institution_type, email, phone, website, status, created_at, updated_at`,
      [tenantId, input.name.trim(), slug, input.institutionType?.trim() || null, input.email?.trim() || null, input.phone?.trim() || null, input.website?.trim() || null, user.id],
    );
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

  async update(id: string, input: UpdateInstitutionDto, request: ContextRequest) {
    const before = await this.get(id, request.context.user!);
    assertScope(request.context.user!, id);
    const result = await this.db.query(
      `UPDATE institutions
       SET name = COALESCE($2, name), status = COALESCE($3, status), email = COALESCE($4, email),
           phone = COALESCE($5, phone), website = COALESCE($6, website), updated_by = $7, updated_at = now()
       WHERE id = $1 RETURNING id, tenant_id, name, slug, institution_type, email, phone, website, status, created_at, updated_at`,
      [id, input.name?.trim() || null, input.status ?? null, input.email?.trim() || null, input.phone?.trim() || null, input.website?.trim() || null, request.context.user!.id],
    );
    const institution = result.rows[0];
    await this.audit.record({
      tenantId: institution.tenant_id,
      institutionId: id,
      actorUserId: request.context.user!.id,
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
}