import type { ContextRequest } from "../../common/request-context";
import { AssignPermissionsDto, CreateRoleDto } from "./rbac.dto";
import { RbacService } from "./rbac.service";
export declare class RbacController {
    private readonly rbac;
    constructor(rbac: RbacService);
    roles(request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow[];
        meta: {
            requestId?: string | undefined;
        };
    }>;
    createRole(input: CreateRoleDto, request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow;
        meta: {
            requestId?: string | undefined;
        };
    }>;
    permissions(request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow[];
        meta: {
            requestId?: string | undefined;
        };
    }>;
    assignPermissions(roleId: string, input: AssignPermissionsDto, request: ContextRequest): Promise<{
        success: boolean;
        data: {
            roleId: string;
            permissionIds: string[];
        };
        meta: {
            requestId?: string | undefined;
        };
    }>;
}
