import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { paginationFrom } from "../../common/pagination";
import { paginatedResponse, successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import { CreateCampusDto, UpdateCampusDto } from "./campus.dto";
import { CampusesService } from "./campuses.service";

@Controller("campuses")
@UseGuards(AuthGuard, PermissionGuard)
export class CampusesController {
  constructor(private readonly campuses: CampusesService) {}

  @Get()
  @RequirePermission("platform.institution.view")
  async list(@Query("institutionId") institutionId: string, @Req() request: ContextRequest) {
    const pagination = paginationFrom(request);
    const result = await this.campuses.list(institutionId, request.context.user!.tenantId, pagination.page, pagination.pageSize, pagination.offset);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Get(":id")
  @RequirePermission("platform.institution.view")
  async get(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.campuses.get(id, request.context.user!.tenantId), request);
  }

  @Post()
  @RequirePermission("platform.institution.update")
  async create(@Body() input: CreateCampusDto, @Req() request: ContextRequest) {
    return successResponse(await this.campuses.create(input, request), request);
  }

  @Patch(":id")
  @RequirePermission("platform.institution.update")
  async update(@Param("id") id: string, @Body() input: UpdateCampusDto, @Req() request: ContextRequest) {
    return successResponse(await this.campuses.update(id, input, request), request);
  }
}