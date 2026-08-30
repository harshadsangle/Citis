import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { paginationFrom } from "../../common/pagination";
import { paginatedResponse, successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import { CreateInstitutionDto, UpdateInstitutionDto } from "./institution.dto";
import { InstitutionsService } from "./institutions.service";

@Controller("institutions")
@UseGuards(AuthGuard, PermissionGuard)
export class InstitutionsController {
  constructor(private readonly institutions: InstitutionsService) {}

  @Get()
  @RequirePermission("platform.institution.view")
  async list(@Req() request: ContextRequest, @Query("tenantId") tenantId?: string) {
    const pagination = paginationFrom(request);
    const result = await this.institutions.list(request.context.user!, pagination.page, pagination.pageSize, pagination.offset, tenantId);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Get(":id")
  @RequirePermission("platform.institution.view")
  async get(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.institutions.get(id, request.context.user!), request);
  }

  @Post()
  @RequirePermission("platform.institution.create")
  async create(@Body() input: CreateInstitutionDto, @Req() request: ContextRequest) {
    return successResponse(await this.institutions.create(input, request), request);
  }

  @Patch(":id")
  @RequirePermission("platform.institution.update")
  async update(@Param("id") id: string, @Body() input: UpdateInstitutionDto, @Req() request: ContextRequest) {
    return successResponse(await this.institutions.update(id, input, request), request);
  }
}