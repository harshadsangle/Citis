import type { ContextRequest } from "../../common/request-context";
import { AssignRoleDto, CreateUserDto, UpdateUserDto } from "./user.dto";
import { UsersService } from "./users.service";
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    list(request: ContextRequest, tenantId?: string): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow[];
        meta: {
            requestId?: string | undefined;
        };
    }>;
    get(id: string, request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow;
        meta: {
            requestId?: string | undefined;
        };
    }>;
    create(input: CreateUserDto, request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow;
        meta: {
            requestId?: string | undefined;
        };
    }>;
    update(id: string, input: UpdateUserDto, request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow;
        meta: {
            requestId?: string | undefined;
        };
    }>;
    assignRole(id: string, input: AssignRoleDto, request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow;
        meta: {
            requestId?: string | undefined;
        };
    }>;
}
