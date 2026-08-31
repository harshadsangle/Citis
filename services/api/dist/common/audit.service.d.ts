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
export declare class AuditService {
    private readonly db;
    constructor(db: DatabaseService);
    record(input: AuditInput): Promise<void>;
}
