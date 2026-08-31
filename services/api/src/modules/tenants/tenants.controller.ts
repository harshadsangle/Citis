import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { paginatedResponse, successResponse } from "../../common/response";
import { paginationFrom } from "../../common/pagination";
import { AuthGuard } from "../auth/auth.guard";
import { PermissionGuard } from "../../guards/permission.guard";
import { RequirePermission } from "../../guards/permission.decorator";
import { CreateTenantDto, UpdateTenantDto } from "./tenant.dto";
import { TenantsService } from "./tenants.service";

@Controller("tenants")
@UseGuards(AuthGuard, PermissionGuard)
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Get()
  @RequirePermission("platform.tenant.view")
  async list(@Req() request: ContextRequest) {
    const pagination = paginationFrom(request);
    const result = await this.tenants.list(request.context.user!, pagination.page, pagination.pageSize, pagination.offset);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Get(":id")
  @RequirePermission("platform.tenant.view")
  async get(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.tenants.get(id, request.context.user!), request);
  }

  @Post()
  @RequirePermission("platform.tenant.create")
  async create(@Body() input: CreateTenantDto, @Req() request: ContextRequest) {
    return successResponse(await this.tenants.create(input, request), request);
  }

  @Patch(":id")
  @RequirePermission("platform.tenant.update")
  async update(@Param("id") id: string, @Body() input: UpdateTenantDto, @Req() request: ContextRequest) {
    return successResponse(await this.tenants.update(id, input, request), request);
  }
}