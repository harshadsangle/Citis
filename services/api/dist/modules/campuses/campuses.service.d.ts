import { AuditService } from "../../common/audit.service";
import type { AuthenticatedUser } from "../../common/request-context";
import type { ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type { CreateCampusDto, UpdateCampusDto } from "./campus.dto";
export declare class CampusesService {
    private readonly db;
    private readonly audit;
    constructor(db: DatabaseService, audit: AuditService);
    list(institutionId: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number): Promise<{
        data: Record<string, unknown>[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    get(id: string, user: AuthenticatedUser): Promise<import("pg").QueryResultRow>;
    create(input: CreateCampusDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    update(id: string, input: UpdateCampusDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
}
