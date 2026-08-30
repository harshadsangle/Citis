import type { ContextRequest } from "../../common/request-context";
import { CreateTenantDto, UpdateTenantDto } from "./tenant.dto";
import { TenantsService } from "./tenants.service";
export declare class TenantsController {
    private readonly tenants;
    constructor(tenants: TenantsService);
    list(request: ContextRequest): Promise<{
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
    create(input: CreateTenantDto, request: ContextRequest): Promise<{
        success: boolean;
        data: any;
        meta: {
            requestId?: string | undefined;
        };
    }>;
    update(id: string, input: UpdateTenantDto, request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow;
        meta: {
            requestId?: string | undefined;
        };
    }>;
}
