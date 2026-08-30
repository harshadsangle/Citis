import type { ContextRequest } from "../../common/request-context";
import { ActivateModuleDto } from "./module.dto";
import { ModulesService } from "./modules.service";
export declare class ModulesController {
    private readonly modules;
    constructor(modules: ModulesService);
    catalog(request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    tenantModules(request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    activate(input: ActivateModuleDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
}
