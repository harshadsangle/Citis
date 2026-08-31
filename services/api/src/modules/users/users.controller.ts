import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { paginationFrom } from "../../common/pagination";
import { paginatedResponse, successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import { AssignRoleDto, CreateUserDto, UpdateUserDto } from "./user.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(AuthGuard, PermissionGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermission("identity.user.view")
  async list(@Req() request: ContextRequest, @Query("tenantId") tenantId?: string) {
    const pagination = paginationFrom(request);
    const result = await this.users.list(request.context.user!, pagination.page, pagination.pageSize, pagination.offset, tenantId);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Get(":id")
  @RequirePermission("identity.user.view")
  async get(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.users.get(id, request.context.user!), request);
  }

  @Post()
  @RequirePermission("identity.user.create")
  async create(@Body() input: CreateUserDto, @Req() request: ContextRequest) {
    return successResponse(await this.users.create(input, request), request);
  }

  @Patch(":id")
  @RequirePermission("identity.user.update")
  async update(@Param("id") id: string, @Body() input: UpdateUserDto, @Req() request: ContextRequest) {
    return successResponse(await this.users.update(id, input, request), request);
  }

  @Post(":id/roles")
  @RequirePermission("identity.role.update")
  async assignRole(@Param("id") id: string, @Body() input: AssignRoleDto, @Req() request: ContextRequest) {
    return successResponse(await this.users.assignRole(id, input, request), request);
  }
}