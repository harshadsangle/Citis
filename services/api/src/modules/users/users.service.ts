import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { AuditService } from "../../common/audit.service";
import { paginationMeta } from "../../common/pagination";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type { AssignRoleDto, CreateUserDto, UpdateUserDto } from "./user.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private platform(user: AuthenticatedUser) {
    return user.roles.some((role) => role.code === "CITIS_SUPER_ADMIN" || role.code === "CITIS_PLATFORM_SUPPORT");
  }

  async list(user: AuthenticatedUser, page: number, pageSize: number, offset: number, tenantId?: string) {
    const scope = this.platform(user) ? tenantId : user.tenantId;
    const values: unknown[] = [];
    const where = scope ? "WHERE u.tenant_id = $1" : "";
    if (scope) values.push(scope);
    const [rows, total] = await Promise.all([
      this.db.query(`SELECT u.id, u.tenant_id, u.email, u.mobile, u.first_name, u.last_name, u.profile_image, u.status, u.last_login_at, u.created_at, u.updated_at
        FROM users u ${where} ORDER BY u.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, pageSize, offset]),
      this.db.query<{ count: string }>(`SELECT count(*)::text AS count FROM users u ${where}`, values),
    ]);
    return { data: rows.rows, meta: paginationMeta(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
  }

  async get(id: string, user: AuthenticatedUser) {
    const result = await this.db.query(
      `SELECT u.id, u.tenant_id, u.email, u.mobile, u.first_name, u.last_name, u.profile_image, u.status, u.last_login_at, u.created_at, u.updated_at
       FROM users u WHERE u.id = $1 AND ($2::uuid IS NULL OR u.tenant_id = $2)`,
      [id, this.platform(user) ? null : user.tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("User not found.");
    return result.rows[0];
  }

  async create(input: CreateUserDto, request: ContextRequest) {
    const actor = request.context.user!;
    const tenantId = this.platform(actor) ? input.tenantId : actor.tenantId;
    if (!tenantId) throw new NotFoundException("A tenant scope is required.");
    const passwordHash = input.password ? await bcrypt.hash(input.password, 12) : null;
    const result = await this.db.query(
      `INSERT INTO users (tenant_id, email, mobile, password_hash, first_name, last_name, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       RETURNING id, tenant_id, email, mobile, first_name, last_name, profile_image, status, last_login_at, created_at, updated_at`,
      [tenantId, input.email?.trim().toLowerCase() || null, input.mobile?.trim() || null, passwordHash, input.firstName.trim(), input.lastName?.trim() || "", actor.id],
    );
    const user = result.rows[0];
    await this.audit.record({ tenantId, actorUserId: actor.id, requestId: request.context.requestId, module: "identity", resource: "user", resourceId: user.id, action: "CREATE", newValue: user, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
    return user;
  }

  async update(id: string, input: UpdateUserDto, request: ContextRequest) {
    const actor = request.context.user!;
    const before = await this.get(id, actor);
    const result = await this.db.query(
      `UPDATE users SET first_name = COALESCE($2, first_name), last_name = COALESCE($3, last_name),
        mobile = COALESCE($4, mobile), status = COALESCE($5, status), updated_by = $6, updated_at = now()
       WHERE id = $1 AND ($7::uuid IS NULL OR tenant_id = $7)
       RETURNING id, tenant_id, email, mobile, first_name, last_name, profile_image, status, last_login_at, created_at, updated_at`,
      [id, input.firstName?.trim() || null, input.lastName?.trim() || null, input.mobile?.trim() || null, input.status ?? null, actor.id, this.platform(actor) ? null : actor.tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("User not found.");
    const user = result.rows[0];
    await this.audit.record({ tenantId: user.tenant_id, actorUserId: actor.id, requestId: request.context.requestId, module: "identity", resource: "user", resourceId: id, action: "UPDATE", previousValue: before, newValue: user, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
    return user;
  }

  async assignRole(id: string, input: AssignRoleDto, request: ContextRequest) {
    const actor = request.context.user!;
    const user = await this.get(id, actor);
    const role = await this.db.query<{ id: string }>("SELECT id FROM roles WHERE id = $1 AND tenant_id = $2 AND status = 'ACTIVE'", [input.roleId, user.tenant_id]);
    if (!role.rows[0]) throw new NotFoundException("Role not found in the user tenant.");
    const result = await this.db.query(
      `INSERT INTO user_roles (tenant_id, user_id, role_id, institution_id, campus_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, role_id, institution_id, campus_id) DO NOTHING
       RETURNING id, tenant_id, user_id, role_id, institution_id, campus_id`,
      [user.tenant_id, id, input.roleId, input.institutionId ?? null, input.campusId ?? null],
    );
    const assignment = result.rows[0] ?? { userId: id, roleId: input.roleId, institutionId: input.institutionId ?? null, campusId: input.campusId ?? null };
    await this.audit.record({ tenantId: user.tenant_id, actorUserId: actor.id, requestId: request.context.requestId, module: "identity", resource: "user_role", resourceId: id, action: "CREATE", newValue: assignment, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
    return assignment;
  }
}