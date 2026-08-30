import type { ContextRequest } from "../../common/request-context";
import { CreateInstitutionDto, UpdateInstitutionDto } from "./institution.dto";
import { InstitutionsService } from "./institutions.service";
export declare class InstitutionsController {
    private readonly institutions;
    constructor(institutions: InstitutionsService);
    list(request: ContextRequest, tenantId?: string): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    get(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    create(input: CreateInstitutionDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    update(id: string, input: UpdateInstitutionDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
}
