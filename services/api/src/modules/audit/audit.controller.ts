import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { paginationFrom, paginationMeta } from "../../common/pagination";
import { paginatedResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import { DatabaseService } from "../../database/database.service";

@Controller("audit-logs")
@UseGuards(AuthGuard, PermissionGuard)
export class AuditController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  @RequirePermission("audit.audit_log.view")
  async list(@Req() request: ContextRequest, @Query("resource") resource?: string) {
    const pagination = paginationFrom(request);
    const result = await this.db.query(
      `SELECT id, tenant_id, institution_id, campus_id, actor_user_id, request_id, module, resource,
              resource_id, action, previous_value, new_value, ip_address, device_context, created_at
       FROM audit_logs
       WHERE tenant_id = $1 AND ($2::text IS NULL OR resource = $2)
       ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
      [request.context.user!.tenantId, resource?.trim() || null, pagination.pageSize, pagination.offset],
    );
    const total = await this.db.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM audit_logs WHERE tenant_id = $1 AND ($2::text IS NULL OR resource = $2)",
      [request.context.user!.tenantId, resource?.trim() || null],
    );
    return paginatedResponse(result.rows, paginationMeta(pagination.page, pagination.pageSize, Number(total.rows[0]?.count ?? 0)), request);
  }
}