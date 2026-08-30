import type { ContextRequest } from "../../common/request-context";
import { CreateCampusDto, UpdateCampusDto } from "./campus.dto";
import { CampusesService } from "./campuses.service";
export declare class CampusesController {
    private readonly campuses;
    constructor(campuses: CampusesService);
    list(institutionId: string, request: ContextRequest): Promise<{
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
    create(input: CreateCampusDto, request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow;
        meta: {
            requestId?: string | undefined;
        };
    }>;
    update(id: string, input: UpdateCampusDto, request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow;
        meta: {
            requestId?: string | undefined;
        };
    }>;
}
