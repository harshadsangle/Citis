import { AuditService } from "../../common/audit.service";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type { CreateInstitutionDto, UpdateInstitutionDto } from "./institution.dto";
export declare class InstitutionsService {
    private readonly db;
    private readonly audit;
    constructor(db: DatabaseService, audit: AuditService);
    private targetTenant;
    list(user: AuthenticatedUser, page: number, pageSize: number, offset: number, tenantId?: string): Promise<{
        data: Record<string, unknown>[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    get(id: string, user: AuthenticatedUser): Promise<import("pg").QueryResultRow>;
    create(input: CreateInstitutionDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    update(id: string, input: UpdateInstitutionDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
}
