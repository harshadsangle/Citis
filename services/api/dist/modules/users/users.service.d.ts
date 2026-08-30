import { AuditService } from "../../common/audit.service";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type { AssignRoleDto, CreateUserDto, UpdateUserDto } from "./user.dto";
export declare class UsersService {
    private readonly db;
    private readonly audit;
    constructor(db: DatabaseService, audit: AuditService);
    private platform;
    list(user: AuthenticatedUser, page: number, pageSize: number, offset: number, tenantId?: string): Promise<{
        data: import("pg").QueryResultRow[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    get(id: string, user: AuthenticatedUser): Promise<import("pg").QueryResultRow>;
    create(input: CreateUserDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    update(id: string, input: UpdateUserDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    assignRole(id: string, input: AssignRoleDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
}
