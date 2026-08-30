import type { ContextRequest } from "../../common/request-context";
import { ActivateModuleDto } from "./module.dto";
import { ModulesService } from "./modules.service";
export declare class ModulesController {
    private readonly modules;
    constructor(modules: ModulesService);
    catalog(request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow[];
        meta: {
            requestId?: string | undefined;
        };
    }>;
    tenantModules(request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow[];
        meta: {
            requestId?: string | undefined;
        };
    }>;
    activate(input: ActivateModuleDto, request: ContextRequest): Promise<{
        success: boolean;
        data: import("pg").QueryResultRow;
        meta: {
            requestId?: string | undefined;
        };
    }>;
}
