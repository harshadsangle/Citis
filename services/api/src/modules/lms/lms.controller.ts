import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { paginationFrom } from "../../common/pagination";
import { paginatedResponse, successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import {
  ContentListQueryDto,
  CreateCourseDto,
  CreateCourseModuleDto,
  CreateLearningResourceDto,
  CreateLessonDto,
  CreateProgrammeDto,
  UpdateCourseDto,
  UpdateCourseModuleDto,
  UpdateLearningResourceDto,
  UpdateLessonDto,
  UpdateProgrammeDto,
} from "./lms.dto";
import { LmsService } from "./lms.service";

@Controller()
@UseGuards(AuthGuard, PermissionGuard)
export class LmsController {
  constructor(private readonly lms: LmsService) {}

  @Get("programmes")
  @RequirePermission("lms.programme.view")
  async programmes(@Req() request: ContextRequest, @Query() query: ContentListQueryDto) {
    const page = paginationFrom(request);
    const result = await this.lms.listProgrammes(request.context.user!, page.page, page.pageSize, page.offset, query);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Post("programmes")
  @RequirePermission("lms.programme.create")
  async createProgramme(@Body() input: CreateProgrammeDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.createProgramme(input, request), request);
  }

  @Get("programmes/:id")
  @RequirePermission("lms.programme.view")
  async programme(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.getProgramme(id, request.context.user!), request);
  }

  @Patch("programmes/:id")
  @RequirePermission("lms.programme.update")
  async updateProgramme(@Param("id") id: string, @Body() input: UpdateProgrammeDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.updateProgramme(id, input, request), request);
  }

  @Post("programmes/:id/publish")
  @RequirePermission("lms.programme.publish")
  async publishProgramme(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.changeStatus(id, "programme", "PUBLISHED", request), request);
  }

  @Post("programmes/:id/archive")
  @RequirePermission("lms.programme.archive")
  async archiveProgramme(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.changeStatus(id, "programme", "ARCHIVED", request), request);
  }

  @Get("courses")
  @RequirePermission("lms.course.view")
  async courses(@Req() request: ContextRequest, @Query("programmeId") programmeId: string | undefined, @Query() query: ContentListQueryDto) {
    const page = paginationFrom(request);
    const result = await this.lms.listCourses(request.context.user!, page.page, page.pageSize, page.offset, query, programmeId);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Post("courses")
  @RequirePermission("lms.course.create")
  async createCourse(@Body() input: CreateCourseDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.createCourse(input, request), request);
  }

  @Get("courses/:id")
  @RequirePermission("lms.course.view")
  async course(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.getCourse(id, request.context.user!), request);
  }

  @Patch("courses/:id")
  @RequirePermission("lms.course.update")
  async updateCourse(@Param("id") id: string, @Body() input: UpdateCourseDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.updateCourse(id, input, request), request);
  }

  @Post("courses/:id/publish")
  @RequirePermission("lms.course.publish")
  async publishCourse(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.changeStatus(id, "course", "PUBLISHED", request), request);
  }

  @Post("courses/:id/archive")
  @RequirePermission("lms.course.archive")
  async archiveCourse(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.changeStatus(id, "course", "ARCHIVED", request), request);
  }

  @Get("course-modules")
  @RequirePermission("lms.course_module.view")
  async courseModules(@Req() request: ContextRequest, @Query("courseId") courseId: string | undefined, @Query() query: ContentListQueryDto) {
    const page = paginationFrom(request);
    const result = await this.lms.listCourseModules(request.context.user!, page.page, page.pageSize, page.offset, query, courseId);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Post("course-modules")
  @RequirePermission("lms.course_module.create")
  async createCourseModule(@Body() input: CreateCourseModuleDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.createCourseModule(input, request), request);
  }

  @Get("course-modules/:id")
  @RequirePermission("lms.course_module.view")
  async courseModule(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.getChild(id, "course_modules", request.context.user!), request);
  }

  @Patch("course-modules/:id")
  @RequirePermission("lms.course_module.update")
  async updateCourseModule(@Param("id") id: string, @Body() input: UpdateCourseModuleDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.updateCourseModule(id, input, request), request);
  }

  @Post("course-modules/:id/publish")
  @RequirePermission("lms.course_module.publish")
  async publishCourseModule(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.changeStatus(id, "course_module", "PUBLISHED", request), request);
  }

  @Post("course-modules/:id/archive")
  @RequirePermission("lms.course_module.archive")
  async archiveCourseModule(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.changeStatus(id, "course_module", "ARCHIVED", request), request);
  }

  @Get("lessons")
  @RequirePermission("lms.lesson.view")
  async lessons(@Req() request: ContextRequest, @Query("moduleId") moduleId: string | undefined, @Query() query: ContentListQueryDto) {
    const page = paginationFrom(request);
    const result = await this.lms.listLessons(request.context.user!, page.page, page.pageSize, page.offset, query, moduleId);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Post("lessons")
  @RequirePermission("lms.lesson.create")
  async createLesson(@Body() input: CreateLessonDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.createLesson(input, request), request);
  }

  @Get("lessons/:id")
  @RequirePermission("lms.lesson.view")
  async lesson(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.getChild(id, "lessons", request.context.user!), request);
  }

  @Patch("lessons/:id")
  @RequirePermission("lms.lesson.update")
  async updateLesson(@Param("id") id: string, @Body() input: UpdateLessonDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.updateLesson(id, input, request), request);
  }

  @Post("lessons/:id/publish")
  @RequirePermission("lms.lesson.publish")
  async publishLesson(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.changeStatus(id, "lesson", "PUBLISHED", request), request);
  }

  @Post("lessons/:id/archive")
  @RequirePermission("lms.lesson.archive")
  async archiveLesson(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.changeStatus(id, "lesson", "ARCHIVED", request), request);
  }

  @Get("learning-resources")
  @RequirePermission("lms.learning_resource.view")
  async learningResources(@Req() request: ContextRequest, @Query("lessonId") lessonId: string | undefined, @Query() query: ContentListQueryDto) {
    const page = paginationFrom(request);
    const result = await this.lms.listResources(request.context.user!, page.page, page.pageSize, page.offset, query, lessonId);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Post("learning-resources")
  @RequirePermission("lms.learning_resource.create")
  async createLearningResource(@Body() input: CreateLearningResourceDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.createLearningResource(input, request), request);
  }

  @Get("learning-resources/:id")
  @RequirePermission("lms.learning_resource.view")
  async learningResource(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.getChild(id, "learning_resources", request.context.user!), request);
  }

  @Patch("learning-resources/:id")
  @RequirePermission("lms.learning_resource.update")
  async updateLearningResource(@Param("id") id: string, @Body() input: UpdateLearningResourceDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.updateLearningResource(id, input, request), request);
  }

  @Post("learning-resources/:id/publish")
  @RequirePermission("lms.learning_resource.publish")
  async publishLearningResource(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.changeStatus(id, "learning_resource", "PUBLISHED", request), request);
  }

  @Post("learning-resources/:id/archive")
  @RequirePermission("lms.learning_resource.archive")
  async archiveLearningResource(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.changeStatus(id, "learning_resource", "ARCHIVED", request), request);
  }
}