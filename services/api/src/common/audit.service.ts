import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

export interface AuditInput {
  tenantId: string;
  institutionId?: string | null;
  campusId?: string | null;
  actorUserId?: string | null;
  requestId: string;
  module: string;
  resource: string;
  resourceId?: string | null;
  action: string;
  previousValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
  deviceContext?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  constructor(private readonly db: DatabaseService) {}

  async record(input: AuditInput) {
    await this.db.query(
      `INSERT INTO audit_logs
        (tenant_id, institution_id, campus_id, actor_user_id, request_id, module, resource,
         resource_id, action, previous_value, new_value, ip_address, device_context)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13::jsonb)`,
      [
        input.tenantId,
        input.institutionId ?? null,
        input.campusId ?? null,
        input.actorUserId ?? null,
        input.requestId,
        input.module,
        input.resource,
        input.resourceId ?? null,
        input.action,
        input.previousValue === undefined ? null : JSON.stringify(input.previousValue),
        input.newValue === undefined ? null : JSON.stringify(input.newValue),
        input.ipAddress ?? null,
        input.deviceContext === undefined ? null : JSON.stringify(input.deviceContext),
      ],
    );
  }
}