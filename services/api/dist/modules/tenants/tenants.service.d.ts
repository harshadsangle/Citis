import { DatabaseService } from "../../database/database.service";
import { AuditService } from "../../common/audit.service";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import type { CreateTenantDto, UpdateTenantDto } from "./tenant.dto";
export declare class TenantsService {
    private readonly db;
    private readonly audit;
    constructor(db: DatabaseService, audit: AuditService);
    private scopedTenantId;
    list(user: AuthenticatedUser, page: number, pageSize: number, offset: number): Promise<{
        data: import("pg").QueryResultRow[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    get(id: string, user: AuthenticatedUser): Promise<import("pg").QueryResultRow>;
    create(input: CreateTenantDto, request: ContextRequest): Promise<any>;
    update(id: string, input: UpdateTenantDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
}
