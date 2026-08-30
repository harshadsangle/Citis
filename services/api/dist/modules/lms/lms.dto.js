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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteAssessmentDto = exports.ProgressViewerQueryDto = exports.AssignInstructorDto = exports.EnrollLearnerDto = exports.CandidateListQueryDto = exports.RelationshipListQueryDto = exports.LMS_RELATIONSHIP_STATUSES = exports.UpdateLearningResourceDto = exports.CreateLearningResourceDto = exports.UpdateLessonDto = exports.CreateLessonDto = exports.UpdateCourseModuleDto = exports.CreateCourseModuleDto = exports.UpdateCourseDto = exports.CreateCourseDto = exports.UpdateProgrammeDto = exports.CreateProgrammeDto = exports.ContentListQueryDto = exports.LMS_RESOURCE_TYPES = exports.LMS_STATUSES = void 0;
const class_validator_1 = require("class-validator");
exports.LMS_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];
exports.LMS_RESOURCE_TYPES = ["VIDEO", "PDF", "DOCUMENT", "PRESENTATION", "LINK", "SCORM", "INTERACTIVE"];
class ContentListQueryDto {
    status;
}
exports.ContentListQueryDto = ContentListQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.LMS_STATUSES),
    __metadata("design:type", String)
], ContentListQueryDto.prototype, "status", void 0);
class CreateProgrammeDto {
    institutionId;
    name;
    code;
    description;
}
exports.CreateProgrammeDto = CreateProgrammeDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateProgrammeDto.prototype, "institutionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], CreateProgrammeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 48),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9][A-Za-z0-9_-]*$/),
    __metadata("design:type", String)
], CreateProgrammeDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(2000),
    __metadata("design:type", String)
], CreateProgrammeDto.prototype, "description", void 0);
class UpdateProgrammeDto {
    name;
    description;
}
exports.UpdateProgrammeDto = UpdateProgrammeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], UpdateProgrammeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(2000),
    __metadata("design:type", String)
], UpdateProgrammeDto.prototype, "description", void 0);
class CreateCourseDto {
    programmeId;
    title;
    code;
    description;
    thumbnail;
}
exports.CreateCourseDto = CreateCourseDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "programmeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 48),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9][A-Za-z0-9_-]*$/),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(2000),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    (0, class_validator_1.Max)(2048),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "thumbnail", void 0);
class UpdateCourseDto {
    title;
    description;
    thumbnail;
}
exports.UpdateCourseDto = UpdateCourseDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(2000),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    (0, class_validator_1.Max)(2048),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "thumbnail", void 0);
class CreateCourseModuleDto {
    courseId;
    title;
    description;
    sequence;
}
exports.CreateCourseModuleDto = CreateCourseModuleDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCourseModuleDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], CreateCourseModuleDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(2000),
    __metadata("design:type", String)
], CreateCourseModuleDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCourseModuleDto.prototype, "sequence", void 0);
class UpdateCourseModuleDto {
    title;
    description;
    sequence;
}
exports.UpdateCourseModuleDto = UpdateCourseModuleDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], UpdateCourseModuleDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(2000),
    __metadata("design:type", String)
], UpdateCourseModuleDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateCourseModuleDto.prototype, "sequence", void 0);
class CreateLessonDto {
    moduleId;
    title;
    description;
    sequence;
    estimatedDuration;
}
exports.CreateLessonDto = CreateLessonDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "moduleId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(2000),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "sequence", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100000),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "estimatedDuration", void 0);
class UpdateLessonDto {
    title;
    description;
    sequence;
    estimatedDuration;
}
exports.UpdateLessonDto = UpdateLessonDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(2000),
    __metadata("design:type", String)
], UpdateLessonDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateLessonDto.prototype, "sequence", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100000),
    __metadata("design:type", Number)
], UpdateLessonDto.prototype, "estimatedDuration", void 0);
class CreateLearningResourceDto {
    lessonId;
    resourceType;
    title;
    url;
    filePath;
    duration;
    sequence;
}
exports.CreateLearningResourceDto = CreateLearningResourceDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLearningResourceDto.prototype, "lessonId", void 0);
__decorate([
    (0, class_validator_1.IsIn)(exports.LMS_RESOURCE_TYPES),
    __metadata("design:type", String)
], CreateLearningResourceDto.prototype, "resourceType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], CreateLearningResourceDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    (0, class_validator_1.Max)(2048),
    __metadata("design:type", String)
], CreateLearningResourceDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(2048),
    __metadata("design:type", String)
], CreateLearningResourceDto.prototype, "filePath", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100000),
    __metadata("design:type", Number)
], CreateLearningResourceDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLearningResourceDto.prototype, "sequence", void 0);
class UpdateLearningResourceDto {
    resourceType;
    title;
    url;
    filePath;
    duration;
    sequence;
}
exports.UpdateLearningResourceDto = UpdateLearningResourceDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.LMS_RESOURCE_TYPES),
    __metadata("design:type", String)
], UpdateLearningResourceDto.prototype, "resourceType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], UpdateLearningResourceDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    (0, class_validator_1.Max)(2048),
    __metadata("design:type", String)
], UpdateLearningResourceDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(2048),
    __metadata("design:type", String)
], UpdateLearningResourceDto.prototype, "filePath", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100000),
    __metadata("design:type", Number)
], UpdateLearningResourceDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateLearningResourceDto.prototype, "sequence", void 0);
exports.LMS_RELATIONSHIP_STATUSES = ["ACTIVE", "REMOVED"];
class RelationshipListQueryDto {
    status;
}
exports.RelationshipListQueryDto = RelationshipListQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.LMS_RELATIONSHIP_STATUSES),
    __metadata("design:type", String)
], RelationshipListQueryDto.prototype, "status", void 0);
class CandidateListQueryDto {
    search;
}
exports.CandidateListQueryDto = CandidateListQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 120),
    __metadata("design:type", String)
], CandidateListQueryDto.prototype, "search", void 0);
class EnrollLearnerDto {
    learnerId;
}
exports.EnrollLearnerDto = EnrollLearnerDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], EnrollLearnerDto.prototype, "learnerId", void 0);
class AssignInstructorDto {
    instructorId;
}
exports.AssignInstructorDto = AssignInstructorDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignInstructorDto.prototype, "instructorId", void 0);
class ProgressViewerQueryDto {
    learnerId;
}
exports.ProgressViewerQueryDto = ProgressViewerQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProgressViewerQueryDto.prototype, "learnerId", void 0);
class CompleteAssessmentDto {
    assessmentId;
    attemptId;
    score;
    passed;
    completedAt;
}
exports.CompleteAssessmentDto = CompleteAssessmentDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CompleteAssessmentDto.prototype, "assessmentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 180),
    __metadata("design:type", String)
], CompleteAssessmentDto.prototype, "attemptId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CompleteAssessmentDto.prototype, "score", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CompleteAssessmentDto.prototype, "passed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CompleteAssessmentDto.prototype, "completedAt", void 0);
//# sourceMappingURL=lms.dto.js.map