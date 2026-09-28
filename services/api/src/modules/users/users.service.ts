import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../../common/audit.service";
import { assertScope, isPlatformUser } from "../../common/access-scope";
import { paginationMeta } from "../../common/pagination";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type {
  ApproveInstructorRequestDto,
  AssignRoleDto,
  CreateUserDto,
  RejectInstructorRequestDto,
  UpdateUserDto,
} from "./user.dto";
import { hashPassword } from "../auth/password-security";

const unscopedRegistrationRoleCodes = new Set(["TEACHER", "INSTRUCTOR", "INSTITUTION_ADMINISTRATOR"]);

@Injectable()
export class UsersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private platform(user: AuthenticatedUser) {
    return isPlatformUser(user);
  }

  async list(
    user: AuthenticatedUser,
    page: number,
    pageSize: number,
    offset: number,
    tenantId?: string,
    statusFilter?: string,
    roleCodeFilter?: string,
  ) {
    const scope = this.platform(user) ? tenantId : user.tenantId;
    const scopedToActor = !isPlatformUser(user);
    const values: unknown[] = [];
    const conditions: string[] = [];
    let status: string | undefined;
    let roleCodes: string[] | undefined;

    if (statusFilter !== undefined) {
      status = statusFilter.trim().toUpperCase();
      if (!["ACTIVE", "PENDING", "DISABLED", "ARCHIVED"].includes(status)) {
        throw new BadRequestException("The requested user status filter is invalid.");
      }
    }
    if (roleCodeFilter !== undefined) {
      const requestedRoleCodes = roleCodeFilter.split(",").map((code) => code.trim().toUpperCase());
      if (
        requestedRoleCodes.length === 0
        || requestedRoleCodes.length > 12
        || requestedRoleCodes.some((code) => !/^[A-Z][A-Z0-9_]*$/.test(code))
      ) {
        throw new BadRequestException("The requested role filter is invalid.");
      }
      roleCodes = [...new Set(requestedRoleCodes)];
    }

    if (scope) {
      values.push(scope);
      conditions.push(`u.tenant_id = $${values.length}`);
    }
    if (scopedToActor) {
      values.push(user.id);
      const actorParameter = values.length;
      const scopePredicate = this.userScopePredicate("u", actorParameter);
      const isPendingStaffRequestList = status === "PENDING"
        && roleCodes?.some((code) => unscopedRegistrationRoleCodes.has(code));
      conditions.push(isPendingStaffRequestList
        ? `(${scopePredicate} OR ${this.unscopedPendingRegistrationPredicate("u", actorParameter)})`
        : scopePredicate);
    }
    if (status !== undefined) {
      values.push(status);
      conditions.push(`u.status = $${values.length}`);
    }
    if (roleCodes !== undefined) {
      values.push(roleCodes);
      conditions.push(`EXISTS (
        SELECT 1
        FROM user_roles filter_ur
        JOIN roles filter_role ON filter_role.id = filter_ur.role_id AND filter_role.tenant_id = filter_ur.tenant_id
        WHERE filter_ur.user_id = u.id
          AND filter_ur.tenant_id = u.tenant_id
          AND filter_role.status = 'ACTIVE'
          AND filter_role.code = ANY($${values.length}::text[])
      )`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows, total] = await Promise.all([
      this.db.query(`SELECT u.id, u.tenant_id, u.email, u.mobile, u.first_name, u.last_name, u.profile_image, u.status, u.last_login_at, u.created_at, u.updated_at,
          COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'id', r.id,
              'code', r.code,
              'name', r.name,
              'institution_id', ur.institution_id,
              'campus_id', ur.campus_id
            ) ORDER BY r.name)
            FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
            WHERE ur.user_id = u.id
              AND ur.tenant_id = u.tenant_id
              AND r.status = 'ACTIVE'
          ), '[]'::jsonb) AS roles
        FROM users u ${where} ORDER BY u.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, pageSize, offset]),
      this.db.query<{ count: string }>(`SELECT count(*)::text AS count FROM users u ${where}`, values),
    ]);
    return { data: rows.rows, meta: paginationMeta(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
  }

  async get(id: string, user: AuthenticatedUser) {
    const scopedToActor = !isPlatformUser(user);
    const result = await this.db.query(
      `SELECT u.id, u.tenant_id, u.email, u.mobile, u.first_name, u.last_name, u.profile_image, u.status, u.last_login_at, u.created_at, u.updated_at,
          COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'id', r.id,
              'code', r.code,
              'name', r.name,
              'institution_id', ur.institution_id,
              'campus_id', ur.campus_id
            ) ORDER BY r.name)
            FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
            WHERE ur.user_id = u.id
              AND ur.tenant_id = u.tenant_id
              AND r.status = 'ACTIVE'
          ), '[]'::jsonb) AS roles
       FROM users u WHERE u.id = $1 AND ($2::uuid IS NULL OR u.tenant_id = $2)${scopedToActor ? ` AND ${this.userScopePredicate("u", 3)}` : ""}`,
      scopedToActor ? [id, user.tenantId, user.id] : [id, this.platform(user) ? null : user.tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("User not found.");
    return result.rows[0];
  }

  async create(input: CreateUserDto, request: ContextRequest) {
    const actor = request.context.user!;
    const tenantId = this.platform(actor) ? input.tenantId : actor.tenantId;
    if (!tenantId) throw new NotFoundException("A tenant scope is required.");
    const passwordHash = input.password ? await hashPassword(input.password) : null;
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
    const scopedToActor = !isPlatformUser(actor);
    const userResult = await this.db.query<{ id: string; tenant_id: string }>(
      "SELECT id, tenant_id FROM users WHERE id = $1 AND ($2::uuid IS NULL OR tenant_id = $2)",
      [id, this.platform(actor) ? null : actor.tenantId],
    );
    if (!userResult.rows[0]) throw new NotFoundException("User not found.");
    const existingScopes = await this.db.query<{ institution_id: string | null; campus_id: string | null }>(
      "SELECT institution_id, campus_id FROM user_roles WHERE user_id = $1 AND tenant_id = $2",
      [id, userResult.rows[0].tenant_id],
    );
    if (scopedToActor && existingScopes.rows.length && !existingScopes.rows.some((scope) => (
      scope.institution_id !== null
      && actor.scopes.some((allowed) => allowed.institutionId === scope.institution_id
        && (allowed.campusId === null || scope.campus_id === null || allowed.campusId === scope.campus_id))
    ))) {
      throw new NotFoundException("User not found.");
    }
    const user = userResult.rows[0];
    const role = await this.db.query<{ id: string; code: string }>("SELECT id, code FROM roles WHERE id = $1 AND tenant_id = $2 AND status = 'ACTIVE'", [input.roleId, user.tenant_id]);
    if (!role.rows[0]) throw new NotFoundException("Role not found in the user tenant.");
    const platformRole = ["CITIS_ADMIN", "CITIS_SUPER_ADMIN", "CITIS_PLATFORM_SUPPORT"].includes(role.rows[0].code);
    if (platformRole && scopedToActor) {
      throw new ForbiddenException("Only platform administrators can assign platform roles.");
    }
    if (platformRole && (input.institutionId || input.campusId)) {
      throw new BadRequestException("Platform roles cannot be assigned to an institution or campus.");
    }
    const requiresInstitution = !platformRole && role.rows[0].code !== "STUDENT";
    if (requiresInstitution && !input.institutionId) {
      throw new BadRequestException("An institution is required for a scoped role.");
    }
    if (input.campusId && !input.institutionId) {
      throw new BadRequestException("A campus must be assigned with its institution.");
    }
    if (input.institutionId) {
      const scope = await this.db.query<{ id: string; campus_id: string | null }>(
        `SELECT i.id, c.id AS campus_id
         FROM institutions i
         LEFT JOIN campuses c ON c.id = $3 AND c.tenant_id = i.tenant_id AND c.institution_id = i.id
         WHERE i.id = $1 AND i.tenant_id = $2 AND i.status <> 'ARCHIVED'
           AND ($3::uuid IS NULL OR c.id IS NOT NULL)`,
        [input.institutionId, user.tenant_id, input.campusId ?? null],
      );
      if (!scope.rows[0] || (input.campusId && scope.rows[0].campus_id !== input.campusId)) {
        throw new NotFoundException("Institution or campus not found in the user tenant.");
      }
      if (scopedToActor) assertScope(actor, input.institutionId, input.campusId ?? null);
    }
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

  async approveInstructorRequest(id: string, input: ApproveInstructorRequestDto, request: ContextRequest) {
    const actor = request.context.user!;
    const approved = await this.db.transaction(async (client) => {
      const pending = await client.query<{
        id: string;
        tenant_id: string;
        role_id: string;
        role_code: string;
        user_role_id: string;
      }>(
        `SELECT u.id, u.tenant_id, r.id AS role_id, r.code AS role_code, ur.id AS user_role_id
         FROM users u
         JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
         JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
         WHERE u.id = $1
           AND ($2::uuid IS NULL OR u.tenant_id = $2)
           AND u.status = 'PENDING'
           AND ur.institution_id IS NULL
           AND ur.campus_id IS NULL
           AND r.code IN ('TEACHER', 'INSTRUCTOR')
           AND r.status = 'ACTIVE'
         ORDER BY CASE r.code WHEN 'TEACHER' THEN 0 ELSE 1 END
         FOR UPDATE OF u, ur`,
        [id, this.platform(actor) ? null : actor.tenantId],
      );
      if (!pending.rows.length) throw new NotFoundException("Pending instructor request not found.");
      if (pending.rows.length !== 1) {
        throw new ConflictException("This request has multiple instructor roles and needs administrator review.");
      }

      const target = pending.rows[0];
      if (!this.platform(actor)) {
        const visibleInstitution = await client.query<{ id: string }>(
          `SELECT id
           FROM institutions
           WHERE tenant_id = $1 AND status <> 'ARCHIVED'
           ORDER BY id
           LIMIT 2`,
          [target.tenant_id],
        );
        if (visibleInstitution.rows.length !== 1 || visibleInstitution.rows[0].id !== input.institutionId) {
          throw new NotFoundException("Pending instructor request not found.");
        }
      }
      const institution = await client.query<{ id: string; campus_id: string | null }>(
        `SELECT i.id, c.id AS campus_id
         FROM institutions i
         LEFT JOIN campuses c
           ON c.id = $3
          AND c.tenant_id = i.tenant_id
          AND c.institution_id = i.id
          AND c.status = 'ACTIVE'
         WHERE i.id = $1
           AND i.tenant_id = $2
           AND i.status = 'ACTIVE'
           AND ($3::uuid IS NULL OR c.id IS NOT NULL)`,
        [input.institutionId, target.tenant_id, input.campusId ?? null],
      );
      if (!institution.rows[0]) {
        throw new NotFoundException("The selected active institution or campus was not found.");
      }
      assertScope(actor, input.institutionId, input.campusId ?? null);

      const duplicateAssignment = await client.query<{ id: string }>(
        `SELECT id FROM user_roles
         WHERE tenant_id = $1
           AND user_id = $2
           AND role_id = $3
           AND institution_id = $4
           AND campus_id IS NOT DISTINCT FROM $5::uuid
         LIMIT 1`,
        [target.tenant_id, target.id, target.role_id, input.institutionId, input.campusId ?? null],
      );
      if (duplicateAssignment.rows[0]) {
        throw new ConflictException("This instructor role is already assigned to the selected scope.");
      }

      const assigned = await client.query(
        `UPDATE user_roles
         SET institution_id = $2, campus_id = $3
         WHERE id = $1
           AND user_id = $4
           AND tenant_id = $5
           AND institution_id IS NULL
           AND campus_id IS NULL
         RETURNING id`,
        [target.user_role_id, input.institutionId, input.campusId ?? null, target.id, target.tenant_id],
      );
      if (!assigned.rows[0]) throw new ConflictException("The instructor request changed before it could be approved.");

      const user = await client.query(
        `UPDATE users
         SET status = 'ACTIVE', updated_by = $2, updated_at = now()
         WHERE id = $1 AND tenant_id = $3 AND status = 'PENDING'
         RETURNING id, tenant_id, email, mobile, first_name, last_name, status`,
        [target.id, actor.id, target.tenant_id],
      );
      if (!user.rows[0]) throw new ConflictException("The instructor request changed before it could be approved.");
      return { user: user.rows[0], tenantId: target.tenant_id, roleCode: target.role_code };
    });

    await this.audit.record({
      tenantId: approved.tenantId,
      institutionId: input.institutionId,
      campusId: input.campusId ?? null,
      actorUserId: actor.id,
      requestId: request.context.requestId,
      module: "identity",
      resource: "instructor_request",
      resourceId: id,
      action: "APPROVE",
      previousValue: { status: "PENDING" },
      newValue: {
        status: "ACTIVE",
        roleCode: approved.roleCode,
        institutionId: input.institutionId,
        campusId: input.campusId ?? null,
      },
      ipAddress: request.context.ipAddress,
      deviceContext: { userAgent: request.context.userAgent },
    });
    return approved.user;
  }

  async rejectInstructorRequest(id: string, input: RejectInstructorRequestDto, request: ContextRequest) {
    const actor = request.context.user!;
    const reason = input.reason.trim();
    if (reason.length < 3) throw new BadRequestException("Enter a reason for rejecting this request.");

    const rejected = await this.db.transaction(async (client) => {
      const pending = await client.query<{ id: string; tenant_id: string; role_code: string }>(
        `SELECT u.id, u.tenant_id, r.code AS role_code
         FROM users u
         JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
         JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
         WHERE u.id = $1
           AND ($2::uuid IS NULL OR u.tenant_id = $2)
           AND u.status = 'PENDING'
           AND ur.institution_id IS NULL
           AND ur.campus_id IS NULL
           AND r.code IN ('TEACHER', 'INSTRUCTOR')
           AND r.status = 'ACTIVE'
         ORDER BY CASE r.code WHEN 'TEACHER' THEN 0 ELSE 1 END
         FOR UPDATE OF u, ur`,
        [id, this.platform(actor) ? null : actor.tenantId],
      );
      if (!pending.rows.length) throw new NotFoundException("Pending instructor request not found.");
      if (pending.rows.length !== 1) {
        throw new ConflictException("This request has multiple instructor roles and needs administrator review.");
      }

      const target = pending.rows[0];
      if (!this.platform(actor)) {
        const visibleInstitution = await client.query<{ id: string }>(
          `SELECT id
           FROM institutions
           WHERE tenant_id = $1 AND status <> 'ARCHIVED'
           ORDER BY id
           LIMIT 2`,
          [target.tenant_id],
        );
        if (visibleInstitution.rows.length !== 1) {
          throw new NotFoundException("Pending instructor request not found.");
        }
        assertScope(actor, visibleInstitution.rows[0].id);
      }
      const user = await client.query(
        `UPDATE users
         SET status = 'DISABLED', updated_by = $2, updated_at = now()
         WHERE id = $1 AND tenant_id = $3 AND status = 'PENDING'
         RETURNING id, tenant_id, email, mobile, first_name, last_name, status`,
        [target.id, actor.id, target.tenant_id],
      );
      if (!user.rows[0]) throw new ConflictException("The instructor request changed before it could be rejected.");
      return { user: user.rows[0], tenantId: target.tenant_id, roleCode: target.role_code };
    });

    await this.audit.record({
      tenantId: rejected.tenantId,
      actorUserId: actor.id,
      requestId: request.context.requestId,
      module: "identity",
      resource: "instructor_request",
      resourceId: id,
      action: "REJECT",
      previousValue: { status: "PENDING" },
      newValue: { status: "DISABLED", roleCode: rejected.roleCode, reason },
      ipAddress: request.context.ipAddress,
      deviceContext: { userAgent: request.context.userAgent },
    });
    return rejected.user;
  }

  private userScopePredicate(alias: string, actorParameter: number) {
    return `EXISTS (
      SELECT 1
      FROM user_roles target_scope
      JOIN user_roles actor_scope
        ON actor_scope.user_id = $${actorParameter}
       AND actor_scope.tenant_id = target_scope.tenant_id
       AND actor_scope.institution_id = target_scope.institution_id
       AND (actor_scope.campus_id IS NULL OR target_scope.campus_id IS NULL OR actor_scope.campus_id = target_scope.campus_id)
      JOIN roles target_role ON target_role.id = target_scope.role_id AND target_role.tenant_id = target_scope.tenant_id
      WHERE target_scope.user_id = ${alias}.id
        AND target_scope.tenant_id = ${alias}.tenant_id
        AND target_role.status = 'ACTIVE'
    )`;
  }

  private unscopedPendingRegistrationPredicate(alias: string, actorParameter: number) {
    return `EXISTS (
      SELECT 1
      FROM user_roles pending_request_scope
      JOIN roles pending_request_role
        ON pending_request_role.id = pending_request_scope.role_id
       AND pending_request_role.tenant_id = pending_request_scope.tenant_id
      WHERE pending_request_scope.user_id = ${alias}.id
        AND pending_request_scope.tenant_id = ${alias}.tenant_id
        AND pending_request_scope.institution_id IS NULL
        AND pending_request_scope.campus_id IS NULL
        AND pending_request_role.status = 'ACTIVE'
        AND pending_request_role.code IN ('TEACHER', 'INSTRUCTOR', 'INSTITUTION_ADMINISTRATOR')
        AND ${alias}.status = 'PENDING'
        AND (
          SELECT count(*)
          FROM institutions tenant_institution
          WHERE tenant_institution.tenant_id = ${alias}.tenant_id
            AND tenant_institution.status <> 'ARCHIVED'
        ) = 1
        AND EXISTS (
          SELECT 1
          FROM user_roles actor_registration_scope
          JOIN institutions actor_registration_institution
            ON actor_registration_institution.id = actor_registration_scope.institution_id
           AND actor_registration_institution.tenant_id = actor_registration_scope.tenant_id
           AND actor_registration_institution.status <> 'ARCHIVED'
          WHERE actor_registration_scope.user_id = $${actorParameter}
            AND actor_registration_scope.tenant_id = ${alias}.tenant_id
            AND actor_registration_scope.institution_id IS NOT NULL
            AND NOT EXISTS (
              SELECT 1
              FROM institutions other_tenant_institution
              WHERE other_tenant_institution.tenant_id = ${alias}.tenant_id
                AND other_tenant_institution.status <> 'ARCHIVED'
                AND other_tenant_institution.id <> actor_registration_scope.institution_id
            )
        )
    )`;
  }
}