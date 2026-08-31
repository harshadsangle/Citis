import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import { AssignPermissionsDto, CreateRoleDto } from "./rbac.dto";
import { RbacService } from "./rbac.service";

@Controller()
@UseGuards(AuthGuard, PermissionGuard)
export class RbacController {
  constructor(private readonly rbac: RbacService) {}

  @Get("roles")
  @RequirePermission("identity.role.view")
  async roles(@Req() request: ContextRequest) {
    const result = await this.rbac.listRoles(request.context.user!.tenantId);
    return successResponse(result.rows, request);
  }

  @Post("roles")
  @RequirePermission("identity.role.create")
  async createRole(@Body() input: CreateRoleDto, @Req() request: ContextRequest) {
    return successResponse(await this.rbac.createRole(input, request), request);
  }

  @Get("permissions")
  @RequirePermission("identity.permission.view")
  async permissions(@Req() request: ContextRequest) {
    const result = await this.rbac.listPermissions();
    return successResponse(result.rows, request);
  }

  @Post("roles/:roleId/permissions")
  @RequirePermission("identity.permission.update")
  async assignPermissions(@Param("roleId") roleId: string, @Body() input: AssignPermissionsDto, @Req() request: ContextRequest) {
    return successResponse(await this.rbac.assignPermissions(roleId, input, request), request);
  }
}