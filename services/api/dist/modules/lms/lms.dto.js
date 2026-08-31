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
exports.GradeAssessmentQuestionDto = exports.GradeAssessmentAttemptDto = exports.SubmitAssessmentAttemptDto = exports.AssessmentAnswerDto = exports.UpdateAssessmentQuestionDto = exports.CreateAssessmentQuestionDto = exports.UpdateAssessmentOptionDto = exports.CreateAssessmentOptionDto = exports.UpdateAssessmentDto = exports.CreateAssessmentDto = exports.LMS_QUESTION_TYPES = exports.LMS_ASSESSMENT_TYPES = exports.GradeAssignmentSubmissionDto = exports.SubmitAssignmentDto = exports.UpdateAssignmentDto = exports.CreateAssignmentDto = exports.AssessmentAttemptListQueryDto = exports.AssignmentListQueryDto = exports.ASSIGNMENT_STATUSES = exports.ProgressViewerQueryDto = exports.AssignInstructorDto = exports.EnrollLearnerDto = exports.CandidateListQueryDto = exports.RelationshipListQueryDto = exports.LMS_RELATIONSHIP_STATUSES = exports.UpdateLearningResourceDto = exports.CreateLearningResourceDto = exports.UpdateLessonDto = exports.CreateLessonDto = exports.UpdateCourseModuleDto = exports.CreateCourseModuleDto = exports.UpdateCourseDto = exports.CreateCourseDto = exports.UpdateProgrammeDto = exports.CreateProgrammeDto = exports.ContentListQueryDto = exports.LMS_RESOURCE_TYPES = exports.LMS_STATUSES = void 0;
const class_transformer_1 = require("class-transformer");
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
    campusId;
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
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateProgrammeDto.prototype, "campusId", void 0);
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
    campusId;
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
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "campusId", void 0);
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
exports.ASSIGNMENT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];
class AssignmentListQueryDto {
    courseId;
    status;
}
exports.AssignmentListQueryDto = AssignmentListQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignmentListQueryDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.ASSIGNMENT_STATUSES),
    __metadata("design:type", String)
], AssignmentListQueryDto.prototype, "status", void 0);
class AssessmentAttemptListQueryDto {
    status;
    gradingStatus;
}
exports.AssessmentAttemptListQueryDto = AssessmentAttemptListQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(["SUBMITTED"]),
    __metadata("design:type", String)
], AssessmentAttemptListQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(["PENDING", "GRADED", "NOT_REQUIRED"]),
    __metadata("design:type", String)
], AssessmentAttemptListQueryDto.prototype, "gradingStatus", void 0);
class CreateAssignmentDto {
    courseId;
    moduleId;
    title;
    description;
    instructions;
    dueAt;
    maxMarks;
}
exports.CreateAssignmentDto = CreateAssignmentDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "moduleId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(4000),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 12000),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "instructions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "dueAt", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.Max)(100000),
    __metadata("design:type", Number)
], CreateAssignmentDto.prototype, "maxMarks", void 0);
class UpdateAssignmentDto {
    title;
    description;
    instructions;
    dueAt;
    maxMarks;
}
exports.UpdateAssignmentDto = UpdateAssignmentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], UpdateAssignmentDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(4000),
    __metadata("design:type", String)
], UpdateAssignmentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 12000),
    __metadata("design:type", String)
], UpdateAssignmentDto.prototype, "instructions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAssignmentDto.prototype, "dueAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.Max)(100000),
    __metadata("design:type", Number)
], UpdateAssignmentDto.prototype, "maxMarks", void 0);
class SubmitAssignmentDto {
    submissionText;
    attachmentUrl;
}
exports.SubmitAssignmentDto = SubmitAssignmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 20000),
    __metadata("design:type", String)
], SubmitAssignmentDto.prototype, "submissionText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    (0, class_validator_1.Max)(2048),
    __metadata("design:type", String)
], SubmitAssignmentDto.prototype, "attachmentUrl", void 0);
class GradeAssignmentSubmissionDto {
    grade;
    feedback;
}
exports.GradeAssignmentSubmissionDto = GradeAssignmentSubmissionDto;
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GradeAssignmentSubmissionDto.prototype, "grade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", String)
], GradeAssignmentSubmissionDto.prototype, "feedback", void 0);
exports.LMS_ASSESSMENT_TYPES = ["PRACTICE_QUIZ", "FORMATIVE", "SUMMATIVE", "ASSIGNMENT", "PROJECT", "VIVA", "PRACTICAL"];
exports.LMS_QUESTION_TYPES = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_TEXT", "NUMERIC"];
class CreateAssessmentDto {
    courseId;
    moduleId;
    title;
    description;
    assessmentType;
    totalMarks;
    passingMarks;
    durationMinutes;
    attemptLimit;
}
exports.CreateAssessmentDto = CreateAssessmentDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAssessmentDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAssessmentDto.prototype, "moduleId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], CreateAssessmentDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(4000),
    __metadata("design:type", String)
], CreateAssessmentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsIn)(exports.LMS_ASSESSMENT_TYPES),
    __metadata("design:type", String)
], CreateAssessmentDto.prototype, "assessmentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAssessmentDto.prototype, "totalMarks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAssessmentDto.prototype, "passingMarks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1440),
    __metadata("design:type", Number)
], CreateAssessmentDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateAssessmentDto.prototype, "attemptLimit", void 0);
class UpdateAssessmentDto {
    title;
    description;
    totalMarks;
    passingMarks;
    durationMinutes;
    attemptLimit;
}
exports.UpdateAssessmentDto = UpdateAssessmentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 180),
    __metadata("design:type", String)
], UpdateAssessmentDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(4000),
    __metadata("design:type", String)
], UpdateAssessmentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateAssessmentDto.prototype, "totalMarks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateAssessmentDto.prototype, "passingMarks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1440),
    __metadata("design:type", Number)
], UpdateAssessmentDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateAssessmentDto.prototype, "attemptLimit", void 0);
class CreateAssessmentOptionDto {
    value;
    label;
    isCorrect;
}
exports.CreateAssessmentOptionDto = CreateAssessmentOptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 300),
    __metadata("design:type", String)
], CreateAssessmentOptionDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 300),
    __metadata("design:type", String)
], CreateAssessmentOptionDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAssessmentOptionDto.prototype, "isCorrect", void 0);
class UpdateAssessmentOptionDto {
    value;
    label;
    isCorrect;
}
exports.UpdateAssessmentOptionDto = UpdateAssessmentOptionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 300),
    __metadata("design:type", String)
], UpdateAssessmentOptionDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 300),
    __metadata("design:type", String)
], UpdateAssessmentOptionDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAssessmentOptionDto.prototype, "isCorrect", void 0);
class CreateAssessmentQuestionDto {
    prompt;
    questionType;
    marks;
    sequence;
    options;
}
exports.CreateAssessmentQuestionDto = CreateAssessmentQuestionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2000),
    __metadata("design:type", String)
], CreateAssessmentQuestionDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsIn)(exports.LMS_QUESTION_TYPES),
    __metadata("design:type", String)
], CreateAssessmentQuestionDto.prototype, "questionType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.Max)(100000),
    __metadata("design:type", Number)
], CreateAssessmentQuestionDto.prototype, "marks", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateAssessmentQuestionDto.prototype, "sequence", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateAssessmentOptionDto),
    __metadata("design:type", Array)
], CreateAssessmentQuestionDto.prototype, "options", void 0);
class UpdateAssessmentQuestionDto {
    prompt;
    marks;
    sequence;
    options;
}
exports.UpdateAssessmentQuestionDto = UpdateAssessmentQuestionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2000),
    __metadata("design:type", String)
], UpdateAssessmentQuestionDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.Max)(100000),
    __metadata("design:type", Number)
], UpdateAssessmentQuestionDto.prototype, "marks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateAssessmentQuestionDto.prototype, "sequence", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateAssessmentOptionDto),
    __metadata("design:type", Array)
], UpdateAssessmentQuestionDto.prototype, "options", void 0);
class AssessmentAnswerDto {
    questionId;
    answer;
}
exports.AssessmentAnswerDto = AssessmentAnswerDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssessmentAnswerDto.prototype, "questionId", void 0);
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AssessmentAnswerDto.prototype, "answer", void 0);
class SubmitAssessmentAttemptDto {
    answers;
}
exports.SubmitAssessmentAttemptDto = SubmitAssessmentAttemptDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AssessmentAnswerDto),
    __metadata("design:type", Array)
], SubmitAssessmentAttemptDto.prototype, "answers", void 0);
class GradeAssessmentAttemptDto {
    grades;
    feedback;
}
exports.GradeAssessmentAttemptDto = GradeAssessmentAttemptDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GradeAssessmentQuestionDto),
    __metadata("design:type", Array)
], GradeAssessmentAttemptDto.prototype, "grades", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", String)
], GradeAssessmentAttemptDto.prototype, "feedback", void 0);
class GradeAssessmentQuestionDto {
    questionId;
    awardedMarks;
}
exports.GradeAssessmentQuestionDto = GradeAssessmentQuestionDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GradeAssessmentQuestionDto.prototype, "questionId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100000),
    __metadata("design:type", Number)
], GradeAssessmentQuestionDto.prototype, "awardedMarks", void 0);
//# sourceMappingURL=lms.dto.js.map