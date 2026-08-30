import type { ContextRequest } from "../../common/request-context";
import { CreateInstitutionDto, UpdateInstitutionDto } from "./institution.dto";
import { InstitutionsService } from "./institutions.service";
export declare class InstitutionsController {
    private readonly institutions;
    constructor(institutions: InstitutionsService);
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
    create(input: CreateInstitutionDto, request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow;
        meta: {
            requestId?: string | undefined;
        };
    }>;
    update(id: string, input: UpdateInstitutionDto, request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow;
        meta: {
            requestId?: string | undefined;
        };
    }>;
}
