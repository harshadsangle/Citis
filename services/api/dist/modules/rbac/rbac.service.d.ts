import { AuditService } from "../../common/audit.service";
import type { ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type { AssignPermissionsDto, CreateRoleDto } from "./rbac.dto";
export declare class RbacService {
    private readonly db;
    private readonly audit;
    constructor(db: DatabaseService, audit: AuditService);
    listRoles(tenantId: string): Promise<import("pg").QueryResult<import("pg").QueryResultRow>>;
    listPermissions(): Promise<import("pg").QueryResult<import("pg").QueryResultRow>>;
    createRole(input: CreateRoleDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    assignPermissions(roleId: string, input: AssignPermissionsDto, request: ContextRequest): Promise<{
        roleId: string;
        permissionIds: string[];
    }>;
}
