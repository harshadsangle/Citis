import type { ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
export declare class AuditController {
    private readonly db;
    constructor(db: DatabaseService);
    list(request: ContextRequest, resource?: string): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
}
