import type { ContextRequest } from "../../common/request-context";
import { CreateTenantDto, UpdateTenantDto } from "./tenant.dto";
import { TenantsService } from "./tenants.service";
export declare class TenantsController {
    private readonly tenants;
    constructor(tenants: TenantsService);
    list(request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    get(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    create(input: CreateTenantDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<any>>;
    update(id: string, input: UpdateTenantDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
}
