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
const pagination_1 = require("../../common/pagination");
const response_1 = require("../../common/response");
const permission_decorator_1 = require("../../guards/permission.decorator");
const permission_guard_1 = require("../../guards/permission.guard");
const auth_guard_1 = require("../auth/auth.guard");
const lms_dto_1 = require("./lms.dto");
const lms_service_1 = require("./lms.service");
let LmsController = class LmsController {
    lms;
    constructor(lms) {
        this.lms = lms;
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
exports.LmsController = LmsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [lms_service_1.LmsService])
], LmsController);
//# sourceMappingURL=lms.controller.js.map