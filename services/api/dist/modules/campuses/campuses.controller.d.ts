import type { ContextRequest } from "../../common/request-context";
import { CreateCampusDto, UpdateCampusDto } from "./campus.dto";
import { CampusesService } from "./campuses.service";
export declare class CampusesController {
    private readonly campuses;
    constructor(campuses: CampusesService);
    list(institutionId: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>[]>>;
    get(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    create(input: CreateCampusDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    update(id: string, input: UpdateCampusDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
}
