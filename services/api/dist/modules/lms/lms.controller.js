"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LmsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const pagination_1 = require("../../common/pagination");
const response_1 = require("../../common/response");
const permission_decorator_1 = require("../../guards/permission.decorator");
const permission_guard_1 = require("../../guards/permission.guard");
const auth_guard_1 = require("../auth/auth.guard");
const lms_dto_1 = require("./lms.dto");
const lms_service_1 = require("./lms.service");
const assessment_service_1 = require("./assessment.service");
let LmsController = class LmsController {
    lms;
    assessments;
    constructor(lms, assessments) {
        this.lms = lms;
        this.assessments = assessments;
    }
    async programmes(request, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.lms.listProgrammes(request.context.user, page.page, page.pageSize, page.offset, query);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async createProgramme(input, request) {
        return (0, response_1.successResponse)(await this.lms.createProgramme(input, request), request);
    }
    async programme(id, request) {
        return (0, response_1.successResponse)(await this.lms.getProgramme(id, request.context.user), request);
    }
    async updateProgramme(id, input, request) {
        return (0, response_1.successResponse)(await this.lms.updateProgramme(id, input, request), request);
    }
    async publishProgramme(id, request) {
        return (0, response_1.successResponse)(await this.lms.changeStatus(id, "programme", "PUBLISHED", request), request);
    }
    async archiveProgramme(id, request) {
        return (0, response_1.successResponse)(await this.lms.changeStatus(id, "programme", "ARCHIVED", request), request);
    }
    async courses(request, programmeId, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.lms.listCourses(request.context.user, page.page, page.pageSize, page.offset, query, programmeId);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async createCourse(input, request) {
        return (0, response_1.successResponse)(await this.lms.createCourse(input, request), request);
    }
    async course(id, request) {
        return (0, response_1.successResponse)(await this.lms.getCourse(id, request.context.user), request);
    }
    async updateCourse(id, input, request) {
        return (0, response_1.successResponse)(await this.lms.updateCourse(id, input, request), request);
    }
    async publishCourse(id, request) {
        return (0, response_1.successResponse)(await this.lms.changeStatus(id, "course", "PUBLISHED", request), request);
    }
    async archiveCourse(id, request) {
        return (0, response_1.successResponse)(await this.lms.changeStatus(id, "course", "ARCHIVED", request), request);
    }
    async enrollmentCandidates(id, request, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.lms.listEnrollmentCandidates(id, request.context.user, page.page, page.pageSize, page.offset, query);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async enrollments(id, request, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.lms.listEnrollments(id, request.context.user, page.page, page.pageSize, page.offset, query);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async enrollLearner(id, input, request) {
        return (0, response_1.successResponse)(await this.lms.enrollLearner(id, input, request), request);
    }
    async removeEnrollment(courseId, enrollmentId, request) {
        return (0, response_1.successResponse)(await this.lms.removeEnrollment(courseId, enrollmentId, request), request);
    }
    async instructorCandidates(id, request, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.lms.listInstructorCandidates(id, request.context.user, page.page, page.pageSize, page.offset, query);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async instructorAssignments(id, request, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.lms.listInstructorAssignments(id, request.context.user, page.page, page.pageSize, page.offset, query);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async assignInstructor(id, input, request) {
        return (0, response_1.successResponse)(await this.lms.assignInstructor(id, input, request), request);
    }
    async removeInstructorAssignment(courseId, assignmentId, request) {
        return (0, response_1.successResponse)(await this.lms.removeInstructorAssignment(courseId, assignmentId, request), request);
    }
    async assignments(request, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.lms.listAssignments(request.context.user, page.page, page.pageSize, page.offset, query);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async createAssignment(input, request) {
        return (0, response_1.successResponse)(await this.lms.createAssignment(input, request), request);
    }
    async assignment(id, request) {
        return (0, response_1.successResponse)(await this.lms.getAssignment(id, request.context.user), request);
    }
    async updateAssignment(id, input, request) {
        return (0, response_1.successResponse)(await this.lms.updateAssignment(id, input, request), request);
    }
    async publishAssignment(id, request) {
        return (0, response_1.successResponse)(await this.lms.changeAssignmentStatus(id, "PUBLISHED", request), request);
    }
    async archiveAssignment(id, request) {
        return (0, response_1.successResponse)(await this.lms.changeAssignmentStatus(id, "ARCHIVED", request), request);
    }
    async assignmentSubmissions(id, request) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.lms.listAssignmentSubmissions(id, request.context.user, page.page, page.pageSize, page.offset);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async myAssignmentSubmission(id, request) {
        return (0, response_1.successResponse)(await this.lms.getMyAssignmentSubmission(id, request.context.user), request);
    }
    async submitAssignment(id, input, request) {
        return (0, response_1.successResponse)(await this.lms.submitAssignment(id, input, request), request);
    }
    async gradeAssignmentSubmission(id, submissionId, input, request) {
        return (0, response_1.successResponse)(await this.lms.gradeAssignmentSubmission(id, submissionId, input, request), request);
    }
    async assessmentsList(request, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.assessments.listAssessments(request.context.user, page.page, page.pageSize, page.offset, query);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async createAssessment(input, request) {
        return (0, response_1.successResponse)(await this.assessments.createAssessment(input, request), request);
    }
    async assessment(id, request) {
        return (0, response_1.successResponse)(await this.assessments.getAssessment(id, request.context.user), request);
    }
    async updateAssessment(id, input, request) {
        return (0, response_1.successResponse)(await this.assessments.updateAssessment(id, input, request), request);
    }
    async publishAssessment(id, request) {
        return (0, response_1.successResponse)(await this.assessments.changeAssessmentStatus(id, "PUBLISHED", request), request);
    }
    async archiveAssessment(id, request) {
        return (0, response_1.successResponse)(await this.assessments.changeAssessmentStatus(id, "ARCHIVED", request), request);
    }
    async assessmentQuestions(id, request) {
        return (0, response_1.successResponse)(await this.assessments.listQuestions(id, request.context.user), request);
    }
    async createAssessmentQuestion(id, input, request) {
        return (0, response_1.successResponse)(await this.assessments.createQuestion(id, input, request), request);
    }
    async updateAssessmentQuestion(id, input, request) {
        return (0, response_1.successResponse)(await this.assessments.updateQuestion(id, input, request), request);
    }
    async archiveAssessmentQuestion(id, request) {
        return (0, response_1.successResponse)(await this.assessments.archiveQuestion(id, request), request);
    }
    async createAssessmentOption(id, input, request) {
        return (0, response_1.successResponse)(await this.assessments.createOption(id, input, request), request);
    }
    async updateAssessmentOption(id, input, request) {
        return (0, response_1.successResponse)(await this.assessments.updateOption(id, input, request), request);
    }
    async archiveAssessmentOption(id, request) {
        return (0, response_1.successResponse)(await this.assessments.archiveOption(id, request), request);
    }
    async startAssessmentAttempt(id, request) {
        return (0, response_1.successResponse)(await this.assessments.startAttempt(id, request), request);
    }
    async assessmentAttempts(id, request, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.assessments.listAttempts(id, request.context.user, page.page, page.pageSize, page.offset, query);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async assessmentAttempt(id, request) {
        return (0, response_1.successResponse)(await this.assessments.getAttempt(id, request.context.user), request);
    }
    async submitAssessmentAttempt(id, input, request) {
        return (0, response_1.successResponse)(await this.assessments.submitAttempt(id, input, request), request);
    }
    async saveAssessmentDraft(id, input, request) {
        return (0, response_1.successResponse)(await this.assessments.saveDraft(id, input, request), request);
    }
    async gradeAssessmentAttempt(id, input, request) {
        return (0, response_1.successResponse)(await this.assessments.gradeAttempt(id, input, request), request);
    }
    async assessmentHistory(request) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.assessments.listLearnerHistory(request.context.user, page.page, page.pageSize, page.offset);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async learnerProgress(request) {
        return (0, response_1.successResponse)(await this.lms.listLearnerProgress(request.context.user), request);
    }
    async courseProgress(courseId, request, query) {
        return (0, response_1.successResponse)(await this.lms.getCourseProgress(courseId, request.context.user, query.learnerId), request);
    }
    async completeLesson(lessonId, request) {
        return (0, response_1.successResponse)(await this.lms.completeLesson(lessonId, request), request);
    }
    async courseModules(request, courseId, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.lms.listCourseModules(request.context.user, page.page, page.pageSize, page.offset, query, courseId);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async createCourseModule(input, request) {
        return (0, response_1.successResponse)(await this.lms.createCourseModule(input, request), request);
    }
    async courseModule(id, request) {
        return (0, response_1.successResponse)(await this.lms.getChild(id, "course_modules", request.context.user), request);
    }
    async updateCourseModule(id, input, request) {
        return (0, response_1.successResponse)(await this.lms.updateCourseModule(id, input, request), request);
    }
    async publishCourseModule(id, request) {
        return (0, response_1.successResponse)(await this.lms.changeStatus(id, "course_module", "PUBLISHED", request), request);
    }
    async archiveCourseModule(id, request) {
        return (0, response_1.successResponse)(await this.lms.changeStatus(id, "course_module", "ARCHIVED", request), request);
    }
    async lessons(request, moduleId, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.lms.listLessons(request.context.user, page.page, page.pageSize, page.offset, query, moduleId);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async createLesson(input, request) {
        return (0, response_1.successResponse)(await this.lms.createLesson(input, request), request);
    }
    async lesson(id, request) {
        return (0, response_1.successResponse)(await this.lms.getChild(id, "lessons", request.context.user), request);
    }
    async updateLesson(id, input, request) {
        return (0, response_1.successResponse)(await this.lms.updateLesson(id, input, request), request);
    }
    async publishLesson(id, request) {
        return (0, response_1.successResponse)(await this.lms.changeStatus(id, "lesson", "PUBLISHED", request), request);
    }
    async archiveLesson(id, request) {
        return (0, response_1.successResponse)(await this.lms.changeStatus(id, "lesson", "ARCHIVED", request), request);
    }
    async learningResources(request, lessonId, query) {
        const page = (0, pagination_1.paginationFrom)(request);
        const result = await this.lms.listResources(request.context.user, page.page, page.pageSize, page.offset, query, lessonId);
        return (0, response_1.paginatedResponse)(result.data, result.meta, request);
    }
    async createLearningResource(input, request) {
        return (0, response_1.successResponse)(await this.lms.createLearningResource(input, request), request);
    }
    async learningResource(id, request) {
        return (0, response_1.successResponse)(await this.lms.getChild(id, "learning_resources", request.context.user), request);
    }
    async updateLearningResource(id, input, request) {
        return (0, response_1.successResponse)(await this.lms.updateLearningResource(id, input, request), request);
    }
    async publishLearningResource(id, request) {
        return (0, response_1.successResponse)(await this.lms.changeStatus(id, "learning_resource", "PUBLISHED", request), request);
    }
    async archiveLearningResource(id, request) {
        return (0, response_1.successResponse)(await this.lms.changeStatus(id, "learning_resource", "ARCHIVED", request), request);
    }
    async uploadLearningResourceFile(id, file, request) {
        return (0, response_1.successResponse)(await this.lms.uploadResourceFile(id, file, request), request);
    }
    async uploadScormPackage(id, file, request) {
        return (0, response_1.successResponse)(await this.lms.uploadScormPackage(id, file, request), request);
    }
    async downloadLearningResourceFile(id, request, response) {
        const file = await this.lms.getManagedFile(id, request);
        response.setHeader("Content-Type", String(file.mimeType));
        response.setHeader("Content-Disposition", `inline; filename="${String(file.filename).replace(/[\r\n"]/g, "")}"`);
        response.setHeader("X-Content-Type-Options", "nosniff");
        return response.send(file.content);
    }
    async launchScorm(id, request) {
        return (0, response_1.successResponse)(await this.lms.getScormLaunch(id, request), request);
    }
    async serveScormAsset(id, asset, request, response) {
        const file = await this.lms.getScormAsset(id, asset, request);
        response.setHeader("Content-Type", String(file.mimeType));
        response.setHeader("Content-Disposition", "inline");
        response.setHeader("X-Content-Type-Options", "nosniff");
        return response.send(file.content);
    }
};
exports.LmsController = LmsController;
__decorate([
    (0, common_1.Get)("programmes"),
    (0, permission_decorator_1.RequirePermission)("lms.programme.view"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, lms_dto_1.ContentListQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "programmes", null);
__decorate([
    (0, common_1.Post)("programmes"),
    (0, permission_decorator_1.RequirePermission)("lms.programme.create"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lms_dto_1.CreateProgrammeDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "createProgramme", null);
__decorate([
    (0, common_1.Get)("programmes/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.programme.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "programme", null);
__decorate([
    (0, common_1.Patch)("programmes/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.programme.update"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.UpdateProgrammeDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "updateProgramme", null);
__decorate([
    (0, common_1.Post)("programmes/:id/publish"),
    (0, permission_decorator_1.RequirePermission)("lms.programme.publish"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "publishProgramme", null);
__decorate([
    (0, common_1.Post)("programmes/:id/archive"),
    (0, permission_decorator_1.RequirePermission)("lms.programme.archive"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "archiveProgramme", null);
__decorate([
    (0, common_1.Get)("courses"),
    (0, permission_decorator_1.RequirePermission)("lms.course.view"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("programmeId")),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, lms_dto_1.ContentListQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "courses", null);
__decorate([
    (0, common_1.Post)("courses"),
    (0, permission_decorator_1.RequirePermission)("lms.course.create"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lms_dto_1.CreateCourseDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Get)("courses/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.course.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "course", null);
__decorate([
    (0, common_1.Patch)("courses/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.course.update"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.UpdateCourseDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Post)("courses/:id/publish"),
    (0, permission_decorator_1.RequirePermission)("lms.course.publish"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "publishCourse", null);
__decorate([
    (0, common_1.Post)("courses/:id/archive"),
    (0, permission_decorator_1.RequirePermission)("lms.course.archive"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "archiveCourse", null);
__decorate([
    (0, common_1.Get)("courses/:id/enrollment-candidates"),
    (0, permission_decorator_1.RequirePermission)("lms.enrollment.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, lms_dto_1.CandidateListQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "enrollmentCandidates", null);
__decorate([
    (0, common_1.Get)("courses/:id/enrollments"),
    (0, permission_decorator_1.RequirePermission)("lms.enrollment.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, lms_dto_1.RelationshipListQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "enrollments", null);
__decorate([
    (0, common_1.Post)("courses/:id/enrollments"),
    (0, permission_decorator_1.RequirePermission)("lms.enrollment.create"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.EnrollLearnerDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "enrollLearner", null);
__decorate([
    (0, common_1.Post)("courses/:courseId/enrollments/:enrollmentId/remove"),
    (0, permission_decorator_1.RequirePermission)("lms.enrollment.archive"),
    __param(0, (0, common_1.Param)("courseId")),
    __param(1, (0, common_1.Param)("enrollmentId")),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "removeEnrollment", null);
__decorate([
    (0, common_1.Get)("courses/:id/instructor-candidates"),
    (0, permission_decorator_1.RequirePermission)("lms.instructor_assignment.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, lms_dto_1.CandidateListQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "instructorCandidates", null);
__decorate([
    (0, common_1.Get)("courses/:id/instructor-assignments"),
    (0, permission_decorator_1.RequirePermission)("lms.instructor_assignment.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, lms_dto_1.RelationshipListQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "instructorAssignments", null);
__decorate([
    (0, common_1.Post)("courses/:id/instructor-assignments"),
    (0, permission_decorator_1.RequirePermission)("lms.instructor_assignment.create"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.AssignInstructorDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "assignInstructor", null);
__decorate([
    (0, common_1.Post)("courses/:courseId/instructor-assignments/:assignmentId/remove"),
    (0, permission_decorator_1.RequirePermission)("lms.instructor_assignment.archive"),
    __param(0, (0, common_1.Param)("courseId")),
    __param(1, (0, common_1.Param)("assignmentId")),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "removeInstructorAssignment", null);
__decorate([
    (0, common_1.Get)("assignments"),
    (0, permission_decorator_1.RequirePermission)("lms.assignment.view"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, lms_dto_1.AssignmentListQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "assignments", null);
__decorate([
    (0, common_1.Post)("assignments"),
    (0, permission_decorator_1.RequirePermission)("lms.assignment.create"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lms_dto_1.CreateAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "createAssignment", null);
__decorate([
    (0, common_1.Get)("assignments/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.assignment.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "assignment", null);
__decorate([
    (0, common_1.Patch)("assignments/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.assignment.update"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.UpdateAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "updateAssignment", null);
__decorate([
    (0, common_1.Post)("assignments/:id/publish"),
    (0, permission_decorator_1.RequirePermission)("lms.assignment.publish"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "publishAssignment", null);
__decorate([
    (0, common_1.Post)("assignments/:id/archive"),
    (0, permission_decorator_1.RequirePermission)("lms.assignment.archive"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "archiveAssignment", null);
__decorate([
    (0, common_1.Get)("assignments/:id/submissions"),
    (0, permission_decorator_1.RequirePermission)("lms.assignment_submission.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "assignmentSubmissions", null);
__decorate([
    (0, common_1.Get)("assignments/:id/submission"),
    (0, permission_decorator_1.RequirePermission)("lms.assignment_submission.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "myAssignmentSubmission", null);
__decorate([
    (0, common_1.Post)("assignments/:id/submissions"),
    (0, permission_decorator_1.RequirePermission)("lms.assignment_submission.create"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.SubmitAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "submitAssignment", null);
__decorate([
    (0, common_1.Patch)("assignments/:id/submissions/:submissionId/grade"),
    (0, permission_decorator_1.RequirePermission)("lms.assignment_submission.update"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("submissionId")),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, lms_dto_1.GradeAssignmentSubmissionDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "gradeAssignmentSubmission", null);
__decorate([
    (0, common_1.Get)("assessments"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment.view"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, lms_dto_1.AssignmentListQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "assessmentsList", null);
__decorate([
    (0, common_1.Post)("assessments"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment.create"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lms_dto_1.CreateAssessmentDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "createAssessment", null);
__decorate([
    (0, common_1.Get)("assessments/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment.view"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "assessment", null);
__decorate([
    (0, common_1.Patch)("assessments/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment.update"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.UpdateAssessmentDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "updateAssessment", null);
__decorate([
    (0, common_1.Post)("assessments/:id/publish"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment.publish"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "publishAssessment", null);
__decorate([
    (0, common_1.Post)("assessments/:id/archive"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment.archive"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "archiveAssessment", null);
__decorate([
    (0, common_1.Get)("assessments/:id/questions"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_question.view"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "assessmentQuestions", null);
__decorate([
    (0, common_1.Post)("assessments/:id/questions"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_question.create"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.CreateAssessmentQuestionDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "createAssessmentQuestion", null);
__decorate([
    (0, common_1.Patch)("assessment-questions/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_question.update"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.UpdateAssessmentQuestionDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "updateAssessmentQuestion", null);
__decorate([
    (0, common_1.Post)("assessment-questions/:id/archive"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_question.archive"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "archiveAssessmentQuestion", null);
__decorate([
    (0, common_1.Post)("assessment-questions/:id/options"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_option.create"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.CreateAssessmentOptionDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "createAssessmentOption", null);
__decorate([
    (0, common_1.Patch)("assessment-options/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_option.update"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.UpdateAssessmentOptionDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "updateAssessmentOption", null);
__decorate([
    (0, common_1.Delete)("assessment-options/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_option.archive"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "archiveAssessmentOption", null);
__decorate([
    (0, common_1.Post)("assessments/:id/attempts"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_attempt.create"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "startAssessmentAttempt", null);
__decorate([
    (0, common_1.Get)("assessments/:id/attempts"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_attempt.view"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, lms_dto_1.AssessmentAttemptListQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "assessmentAttempts", null);
__decorate([
    (0, common_1.Get)("assessment-attempts/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_attempt.view"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "assessmentAttempt", null);
__decorate([
    (0, common_1.Post)("assessment-attempts/:id/submit"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_attempt.update"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.SubmitAssessmentAttemptDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "submitAssessmentAttempt", null);
__decorate([
    (0, common_1.Patch)("assessment-attempts/:id/draft"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_attempt.update"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.SaveAssessmentDraftDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "saveAssessmentDraft", null);
__decorate([
    (0, common_1.Patch)("assessment-attempts/:id/grade"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_attempt.update"),
    __param(0, (0, common_1.Param)("id", new common_1.ParseUUIDPipe({ version: "4" }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.GradeAssessmentAttemptDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "gradeAssessmentAttempt", null);
__decorate([
    (0, common_1.Get)("assessment-history"),
    (0, permission_decorator_1.RequirePermission)("lms.assessment_attempt.view"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "assessmentHistory", null);
__decorate([
    (0, common_1.Get)("progress"),
    (0, permission_decorator_1.RequirePermission)("lms.course_progress.view"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "learnerProgress", null);
__decorate([
    (0, common_1.Get)("progress/courses/:courseId"),
    (0, permission_decorator_1.RequirePermission)("lms.course_progress.view"),
    __param(0, (0, common_1.Param)("courseId")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, lms_dto_1.ProgressViewerQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "courseProgress", null);
__decorate([
    (0, common_1.Post)("progress/lessons/:lessonId/complete"),
    (0, permission_decorator_1.RequirePermission)("lms.lesson_progress.create"),
    __param(0, (0, common_1.Param)("lessonId")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "completeLesson", null);
__decorate([
    (0, common_1.Get)("course-modules"),
    (0, permission_decorator_1.RequirePermission)("lms.course_module.view"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("courseId")),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, lms_dto_1.ContentListQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "courseModules", null);
__decorate([
    (0, common_1.Post)("course-modules"),
    (0, permission_decorator_1.RequirePermission)("lms.course_module.create"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lms_dto_1.CreateCourseModuleDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "createCourseModule", null);
__decorate([
    (0, common_1.Get)("course-modules/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.course_module.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "courseModule", null);
__decorate([
    (0, common_1.Patch)("course-modules/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.course_module.update"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.UpdateCourseModuleDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "updateCourseModule", null);
__decorate([
    (0, common_1.Post)("course-modules/:id/publish"),
    (0, permission_decorator_1.RequirePermission)("lms.course_module.publish"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "publishCourseModule", null);
__decorate([
    (0, common_1.Post)("course-modules/:id/archive"),
    (0, permission_decorator_1.RequirePermission)("lms.course_module.archive"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "archiveCourseModule", null);
__decorate([
    (0, common_1.Get)("lessons"),
    (0, permission_decorator_1.RequirePermission)("lms.lesson.view"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("moduleId")),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, lms_dto_1.ContentListQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "lessons", null);
__decorate([
    (0, common_1.Post)("lessons"),
    (0, permission_decorator_1.RequirePermission)("lms.lesson.create"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lms_dto_1.CreateLessonDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "createLesson", null);
__decorate([
    (0, common_1.Get)("lessons/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.lesson.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "lesson", null);
__decorate([
    (0, common_1.Patch)("lessons/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.lesson.update"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.UpdateLessonDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "updateLesson", null);
__decorate([
    (0, common_1.Post)("lessons/:id/publish"),
    (0, permission_decorator_1.RequirePermission)("lms.lesson.publish"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "publishLesson", null);
__decorate([
    (0, common_1.Post)("lessons/:id/archive"),
    (0, permission_decorator_1.RequirePermission)("lms.lesson.archive"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "archiveLesson", null);
__decorate([
    (0, common_1.Get)("learning-resources"),
    (0, permission_decorator_1.RequirePermission)("lms.learning_resource.view"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)("lessonId")),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, lms_dto_1.ContentListQueryDto]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "learningResources", null);
__decorate([
    (0, common_1.Post)("learning-resources"),
    (0, permission_decorator_1.RequirePermission)("lms.learning_resource.create"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lms_dto_1.CreateLearningResourceDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "createLearningResource", null);
__decorate([
    (0, common_1.Get)("learning-resources/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.learning_resource.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "learningResource", null);
__decorate([
    (0, common_1.Patch)("learning-resources/:id"),
    (0, permission_decorator_1.RequirePermission)("lms.learning_resource.update"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lms_dto_1.UpdateLearningResourceDto, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "updateLearningResource", null);
__decorate([
    (0, common_1.Post)("learning-resources/:id/publish"),
    (0, permission_decorator_1.RequirePermission)("lms.learning_resource.publish"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "publishLearningResource", null);
__decorate([
    (0, common_1.Post)("learning-resources/:id/archive"),
    (0, permission_decorator_1.RequirePermission)("lms.learning_resource.archive"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "archiveLearningResource", null);
__decorate([
    (0, common_1.Post)("learning-resources/:id/file"),
    (0, permission_decorator_1.RequirePermission)("lms.learning_resource.update"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", { limits: { fileSize: 50 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "uploadLearningResourceFile", null);
__decorate([
    (0, common_1.Post)("learning-resources/:id/scorm"),
    (0, permission_decorator_1.RequirePermission)("lms.learning_resource.update"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", { limits: { fileSize: 250 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "uploadScormPackage", null);
__decorate([
    (0, common_1.Get)("learning-resources/:id/file"),
    (0, permission_decorator_1.RequirePermission)("lms.learning_resource.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "downloadLearningResourceFile", null);
__decorate([
    (0, common_1.Get)("learning-resources/:id/scorm/launch"),
    (0, permission_decorator_1.RequirePermission)("lms.learning_resource.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "launchScorm", null);
__decorate([
    (0, common_1.Get)("learning-resources/:id/scorm/*asset"),
    (0, permission_decorator_1.RequirePermission)("lms.learning_resource.view"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("asset")),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], LmsController.prototype, "serveScormAsset", null);
exports.LmsController = LmsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [lms_service_1.LmsService, assessment_service_1.AssessmentService])
], LmsController);
//# sourceMappingURL=lms.controller.js.map