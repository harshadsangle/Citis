import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import type { ContextRequest } from "../../common/request-context";
import { paginationFrom } from "../../common/pagination";
import { paginatedResponse, successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import {
  ContentListQueryDto,
  CandidateListQueryDto,
  AssignInstructorDto,
  AssignmentListQueryDto,
  CompleteAssessmentDto,
  CreateCourseDto,
  CreateCourseModuleDto,
  CreateLearningResourceDto,
  CreateLessonDto,
  CreateProgrammeDto,
  CreateAssignmentDto,
  EnrollLearnerDto,
  GradeAssignmentSubmissionDto,
  ProgressViewerQueryDto,
  RelationshipListQueryDto,
  SubmitAssignmentDto,
  UpdateAssignmentDto,
  UpdateCourseDto,
  UpdateCourseModuleDto,
  UpdateLearningResourceDto,
  UpdateLessonDto,
  UpdateProgrammeDto,
} from "./lms.dto";
import { LmsService } from "./lms.service";
import type { LmsUpload } from "./resource-storage.service";

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

  @Get("courses/:id/enrollment-candidates")
  @RequirePermission("lms.enrollment.view")
  async enrollmentCandidates(@Param("id") id: string, @Req() request: ContextRequest, @Query() query: CandidateListQueryDto) {
    const page = paginationFrom(request);
    const result = await this.lms.listEnrollmentCandidates(id, request.context.user!, page.page, page.pageSize, page.offset, query);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Get("courses/:id/enrollments")
  @RequirePermission("lms.enrollment.view")
  async enrollments(@Param("id") id: string, @Req() request: ContextRequest, @Query() query: RelationshipListQueryDto) {
    const page = paginationFrom(request);
    const result = await this.lms.listEnrollments(id, request.context.user!, page.page, page.pageSize, page.offset, query);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Post("courses/:id/enrollments")
  @RequirePermission("lms.enrollment.create")
  async enrollLearner(@Param("id") id: string, @Body() input: EnrollLearnerDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.enrollLearner(id, input, request), request);
  }

  @Post("courses/:courseId/enrollments/:enrollmentId/remove")
  @RequirePermission("lms.enrollment.archive")
  async removeEnrollment(@Param("courseId") courseId: string, @Param("enrollmentId") enrollmentId: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.removeEnrollment(courseId, enrollmentId, request), request);
  }

  @Get("courses/:id/instructor-candidates")
  @RequirePermission("lms.instructor_assignment.view")
  async instructorCandidates(@Param("id") id: string, @Req() request: ContextRequest, @Query() query: CandidateListQueryDto) {
    const page = paginationFrom(request);
    const result = await this.lms.listInstructorCandidates(id, request.context.user!, page.page, page.pageSize, page.offset, query);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Get("courses/:id/instructor-assignments")
  @RequirePermission("lms.instructor_assignment.view")
  async instructorAssignments(@Param("id") id: string, @Req() request: ContextRequest, @Query() query: RelationshipListQueryDto) {
    const page = paginationFrom(request);
    const result = await this.lms.listInstructorAssignments(id, request.context.user!, page.page, page.pageSize, page.offset, query);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Post("courses/:id/instructor-assignments")
  @RequirePermission("lms.instructor_assignment.create")
  async assignInstructor(@Param("id") id: string, @Body() input: AssignInstructorDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.assignInstructor(id, input, request), request);
  }

  @Post("courses/:courseId/instructor-assignments/:assignmentId/remove")
  @RequirePermission("lms.instructor_assignment.archive")
  async removeInstructorAssignment(@Param("courseId") courseId: string, @Param("assignmentId") assignmentId: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.removeInstructorAssignment(courseId, assignmentId, request), request);
  }

  @Get("assignments")
  @RequirePermission("lms.assignment.view")
  async assignments(@Req() request: ContextRequest, @Query() query: AssignmentListQueryDto) {
    const page = paginationFrom(request);
    const result = await this.lms.listAssignments(request.context.user!, page.page, page.pageSize, page.offset, query);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Post("assignments")
  @RequirePermission("lms.assignment.create")
  async createAssignment(@Body() input: CreateAssignmentDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.createAssignment(input, request), request);
  }

  @Get("assignments/:id")
  @RequirePermission("lms.assignment.view")
  async assignment(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.getAssignment(id, request.context.user!), request);
  }

  @Patch("assignments/:id")
  @RequirePermission("lms.assignment.update")
  async updateAssignment(@Param("id") id: string, @Body() input: UpdateAssignmentDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.updateAssignment(id, input, request), request);
  }

  @Post("assignments/:id/publish")
  @RequirePermission("lms.assignment.publish")
  async publishAssignment(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.changeAssignmentStatus(id, "PUBLISHED", request), request);
  }

  @Post("assignments/:id/archive")
  @RequirePermission("lms.assignment.archive")
  async archiveAssignment(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.changeAssignmentStatus(id, "ARCHIVED", request), request);
  }

  @Get("assignments/:id/submissions")
  @RequirePermission("lms.assignment_submission.view")
  async assignmentSubmissions(@Param("id") id: string, @Req() request: ContextRequest) {
    const page = paginationFrom(request);
    const result = await this.lms.listAssignmentSubmissions(id, request.context.user!, page.page, page.pageSize, page.offset);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Get("assignments/:id/submission")
  @RequirePermission("lms.assignment_submission.view")
  async myAssignmentSubmission(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.getMyAssignmentSubmission(id, request.context.user!), request);
  }

  @Post("assignments/:id/submissions")
  @RequirePermission("lms.assignment_submission.create")
  async submitAssignment(@Param("id") id: string, @Body() input: SubmitAssignmentDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.submitAssignment(id, input, request), request);
  }

  @Patch("assignments/:id/submissions/:submissionId/grade")
  @RequirePermission("lms.assignment_submission.update")
  async gradeAssignmentSubmission(@Param("id") id: string, @Param("submissionId") submissionId: string, @Body() input: GradeAssignmentSubmissionDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.gradeAssignmentSubmission(id, submissionId, input, request), request);
  }

  @Get("progress")
  @RequirePermission("lms.course_progress.view")
  async learnerProgress(@Req() request: ContextRequest) {
    return successResponse(await this.lms.listLearnerProgress(request.context.user!), request);
  }

  @Get("progress/courses/:courseId")
  @RequirePermission("lms.course_progress.view")
  async courseProgress(@Param("courseId") courseId: string, @Req() request: ContextRequest, @Query() query: ProgressViewerQueryDto) {
    return successResponse(await this.lms.getCourseProgress(courseId, request.context.user!, query.learnerId), request);
  }

  @Post("progress/lessons/:lessonId/complete")
  @RequirePermission("lms.lesson_progress.create")
  async completeLesson(@Param("lessonId") lessonId: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.completeLesson(lessonId, request), request);
  }

  @Post("progress/assessment-completions")
  @RequirePermission("lms.assessment_completion.create")
  async completeAssessment(@Body() input: CompleteAssessmentDto, @Req() request: ContextRequest) {
    return successResponse(await this.lms.completeAssessment(input, request), request);
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

  @Post("learning-resources/:id/file")
  @RequirePermission("lms.learning_resource.update")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 50 * 1024 * 1024 } }))
  async uploadLearningResourceFile(@Param("id") id: string, @UploadedFile() file: LmsUpload, @Req() request: ContextRequest) {
    return successResponse(await this.lms.uploadResourceFile(id, file, request), request);
  }

  @Post("learning-resources/:id/scorm")
  @RequirePermission("lms.learning_resource.update")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 250 * 1024 * 1024 } }))
  async uploadScormPackage(@Param("id") id: string, @UploadedFile() file: LmsUpload, @Req() request: ContextRequest) {
    return successResponse(await this.lms.uploadScormPackage(id, file, request), request);
  }

  @Get("learning-resources/:id/file")
  @RequirePermission("lms.learning_resource.view")
  async downloadLearningResourceFile(@Param("id") id: string, @Req() request: ContextRequest, @Res() response: Response) {
    const file = await this.lms.getManagedFile(id, request);
    response.setHeader("Content-Type", String(file.mimeType));
    response.setHeader("Content-Disposition", `inline; filename="${String(file.filename).replace(/[\r\n"]/g, "")}"`);
    response.setHeader("X-Content-Type-Options", "nosniff");
    return response.send(file.content);
  }

  @Get("learning-resources/:id/scorm/launch")
  @RequirePermission("lms.learning_resource.view")
  async launchScorm(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.lms.getScormLaunch(id, request), request);
  }

  @Get("learning-resources/:id/scorm/*asset")
  @RequirePermission("lms.learning_resource.view")
  async serveScormAsset(@Param("id") id: string, @Param("asset") asset: string, @Req() request: ContextRequest, @Res() response: Response) {
    const file = await this.lms.getScormAsset(id, asset, request);
    response.setHeader("Content-Type", String(file.mimeType));
    response.setHeader("Content-Disposition", "inline");
    response.setHeader("X-Content-Type-Options", "nosniff");
    return response.send(file.content);
  }
}