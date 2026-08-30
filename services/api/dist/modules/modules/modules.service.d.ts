import { AuditService } from "../../common/audit.service";
import type { ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type { ActivateModuleDto } from "./module.dto";
export declare class ModulesService {
    private readonly db;
    private readonly audit;
    constructor(db: DatabaseService, audit: AuditService);
    listCatalog(): Promise<import("pg").QueryResult<import("pg").QueryResultRow>>;
    listForTenant(tenantId: string): Promise<import("pg").QueryResult<import("pg").QueryResultRow>>;
    activate(input: ActivateModuleDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
}
