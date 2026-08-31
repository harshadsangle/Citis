import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import { ActivateModuleDto } from "./module.dto";
import { ModulesService } from "./modules.service";

@Controller()
@UseGuards(AuthGuard, PermissionGuard)
export class ModulesController {
  constructor(private readonly modules: ModulesService) {}

  @Get("modules")
  @RequirePermission("platform.module.view")
  async catalog(@Req() request: ContextRequest) {
    return successResponse((await this.modules.listCatalog()).rows, request);
  }

  @Get("tenant-modules")
  @RequirePermission("platform.module.view")
  async tenantModules(@Req() request: ContextRequest) {
    return successResponse((await this.modules.listForTenant(request.context.user!.tenantId)).rows, request);
  }

  @Post("tenant-modules")
  @RequirePermission("platform.module.update")
  async activate(@Body() input: ActivateModuleDto, @Req() request: ContextRequest) {
    return successResponse(await this.modules.activate(input, request), request);
  }
}