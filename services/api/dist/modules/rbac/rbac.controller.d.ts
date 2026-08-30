import type { ContextRequest } from "../../common/request-context";
import { AssignPermissionsDto, CreateRoleDto } from "./rbac.dto";
import { RbacService } from "./rbac.service";
export declare class RbacController {
    private readonly rbac;
    constructor(rbac: RbacService);
    roles(request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    createRole(input: CreateRoleDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    permissions(request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    assignPermissions(roleId: string, input: AssignPermissionsDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        roleId: string;
        permissionIds: string[];
    }>>;
}
