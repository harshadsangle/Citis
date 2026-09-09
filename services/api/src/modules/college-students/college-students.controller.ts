import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { ContextRequest } from "../../common/request-context";
import { paginationFrom } from "../../common/pagination";
import { paginatedResponse, successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import type { LmsUpload } from "../lms/resource-storage.service";
import { CollegeStudentListQueryDto, CollegeStudentStatusDto } from "./college-students.dto";
import { CollegeStudentsService } from "./college-students.service";

@Controller("college-students")
@UseGuards(AuthGuard, PermissionGuard)
export class CollegeStudentsController {
  constructor(private readonly students: CollegeStudentsService) {}

  @Post("imports")
  @RequirePermission("lms.student_import.create")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 5 * 1024 * 1024 } }))
  async import(@UploadedFile() file: LmsUpload, @Req() request: ContextRequest) {
    return successResponse(await this.students.importCsv(file, request), request);
  }

  @Get("imports")
  @RequirePermission("lms.student_import.view")
  async imports(@Req() request: ContextRequest) {
    return successResponse(await this.students.listImports(request.context.user!), request);
  }

  @Get("imports/:id")
  @RequirePermission("lms.student_import.view")
  async importResult(@Param("id", ParseUUIDPipe) id: string, @Req() request: ContextRequest) {
    return successResponse(await this.students.getImport(id, request.context.user!), request);
  }

  @Get()
  @RequirePermission("lms.student_import.view")
  async list(@Query() query: CollegeStudentListQueryDto, @Req() request: ContextRequest) {
    const page = paginationFrom(request);
    const result = await this.students.listStudents(request.context.user!, query, page.page, page.pageSize, page.offset);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Get("lookup/:collegeUserId")
  @RequirePermission("lms.student_import.view")
  async lookup(@Param("collegeUserId") collegeUserId: string, @Req() request: ContextRequest) {
    return successResponse(await this.students.lookup(collegeUserId, request.context.user!), request);
  }

  @Patch(":id/status")
  @RequirePermission("lms.student_import.update")
  async updateStatus(@Param("id", ParseUUIDPipe) id: string, @Body() input: CollegeStudentStatusDto, @Req() request: ContextRequest) {
    return successResponse(await this.students.updateStatus(id, input.status, request), request);
  }

  @Get(":id/activity")
  @RequirePermission("lms.student_import.view")
  async activity(@Param("id", ParseUUIDPipe) id: string, @Req() request: ContextRequest) {
    return successResponse(await this.students.listActivity(id, request.context.user!), request);
  }
}