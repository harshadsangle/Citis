import type { ContextRequest } from "../../common/request-context";
import { AssignRoleDto, CreateUserDto, UpdateUserDto } from "./user.dto";
import { UsersService } from "./users.service";
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    list(request: ContextRequest, tenantId?: string): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    get(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    create(input: CreateUserDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    update(id: string, input: UpdateUserDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    assignRole(id: string, input: AssignRoleDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
}
