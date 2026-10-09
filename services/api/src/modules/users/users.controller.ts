import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { paginationFrom } from "../../common/pagination";
import { paginatedResponse, successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import { StudentLoginActivityService } from "./student-login-activity.service";
import {
  ApproveInstructorRequestDto,
  AssignRoleDto,
  CreateUserDto,
  RejectInstructorRequestDto,
  UpdateUserDto,
} from "./user.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(AuthGuard, PermissionGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly studentLoginActivity: StudentLoginActivityService,
  ) {}

  @Get("me/login-activity")
  @RequirePermission("lms.student_profile.view")
  async ownLoginActivity(@Req() request: ContextRequest, @Query("month") month?: string) {
    return successResponse(
      await this.studentLoginActivity.getActivity(request.context.user!, request.context.user!.id, month),
      request,
    );
  }

  @Get()
  @RequirePermission("lms.instructor_assignment.view")
  async list(
    @Req() request: ContextRequest,
    @Query("tenantId") tenantId?: string,
    @Query("status") status?: string,
    @Query("roleCode") roleCode?: string,
  ) {
    const pagination = paginationFrom(request);
    const result = await this.users.list(
      request.context.user!,
      pagination.page,
      pagination.pageSize,
      pagination.offset,
      tenantId,
      status,
      roleCode,
    );
    return paginatedResponse(result.data, result.meta, request);
  }

  @Get(":id")
  @RequirePermission("lms.instructor_assignment.view")
  async get(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.users.get(id, request.context.user!), request);
  }

  @Get(":id/login-activity")
  @RequirePermission("lms.student_profile.view")
  async loginActivity(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: ContextRequest,
    @Query("month") month?: string,
  ) {
    return successResponse(
      await this.studentLoginActivity.getActivity(request.context.user!, id, month),
      request,
    );
  }

  @Post()
  @RequirePermission("lms.instructor_assignment.create")
  async create(@Body() input: CreateUserDto, @Req() request: ContextRequest) {
    return successResponse(await this.users.create(input, request), request);
  }

  @Patch(":id")
  @RequirePermission("lms.instructor_assignment.create")
  async update(@Param("id") id: string, @Body() input: UpdateUserDto, @Req() request: ContextRequest) {
    return successResponse(await this.users.update(id, input, request), request);
  }

  @Post(":id/roles")
  @RequirePermission("lms.instructor_assignment.create")
  async assignRole(@Param("id") id: string, @Body() input: AssignRoleDto, @Req() request: ContextRequest) {
    return successResponse(await this.users.assignRole(id, input, request), request);
  }

  @Post(":id/instructor-request/approve")
  @RequirePermission("lms.instructor_assignment.create")
  async approveInstructorRequest(
    @Param("id") id: string,
    @Body() input: ApproveInstructorRequestDto,
    @Req() request: ContextRequest,
  ) {
    return successResponse(await this.users.approveInstructorRequest(id, input, request), request);
  }

  @Post(":id/instructor-request/reject")
  @RequirePermission("lms.instructor_assignment.create")
  async rejectInstructorRequest(
    @Param("id") id: string,
    @Body() input: RejectInstructorRequestDto,
    @Req() request: ContextRequest,
  ) {
    return successResponse(await this.users.rejectInstructorRequest(id, input, request), request);
  }
}