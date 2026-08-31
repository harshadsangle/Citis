export declare const LMS_STATUSES: readonly ["DRAFT", "PUBLISHED", "ARCHIVED"];
export declare const LMS_RESOURCE_TYPES: readonly ["VIDEO", "PDF", "DOCUMENT", "PRESENTATION", "LINK", "SCORM", "INTERACTIVE"];
export declare class ContentListQueryDto {
    status?: string;
}
export declare class CreateProgrammeDto {
    institutionId: string;
    campusId?: string;
    name: string;
    code: string;
    description?: string;
}
export declare class UpdateProgrammeDto {
    name?: string;
    description?: string;
}
export declare class CreateCourseDto {
    programmeId: string;
    campusId?: string;
    title: string;
    code: string;
    description?: string;
    thumbnail?: string;
}
export declare class UpdateCourseDto {
    title?: string;
    description?: string;
    thumbnail?: string;
}
export declare class CreateCourseModuleDto {
    courseId: string;
    title: string;
    description?: string;
    sequence: number;
}
export declare class UpdateCourseModuleDto {
    title?: string;
    description?: string;
    sequence?: number;
}
export declare class CreateLessonDto {
    moduleId: string;
    title: string;
    description?: string;
    sequence: number;
    estimatedDuration?: number;
}
export declare class UpdateLessonDto {
    title?: string;
    description?: string;
    sequence?: number;
    estimatedDuration?: number;
}
export declare class CreateLearningResourceDto {
    lessonId: string;
    resourceType: string;
    title: string;
    url?: string;
    filePath?: string;
    duration?: number;
    sequence: number;
}
export declare class UpdateLearningResourceDto {
    resourceType?: string;
    title?: string;
    url?: string;
    filePath?: string;
    duration?: number;
    sequence?: number;
}
export declare const LMS_RELATIONSHIP_STATUSES: readonly ["ACTIVE", "REMOVED"];
export declare class RelationshipListQueryDto {
    status?: string;
}
export declare class CandidateListQueryDto {
    search?: string;
}
export declare class EnrollLearnerDto {
    learnerId: string;
}
export declare class AssignInstructorDto {
    instructorId: string;
}
export declare class ProgressViewerQueryDto {
    learnerId?: string;
}
export declare class CompleteAssessmentDto {
    assessmentId: string;
    attemptId: string;
    score?: number;
    passed?: boolean;
    completedAt?: string;
}
export declare const ASSIGNMENT_STATUSES: readonly ["DRAFT", "PUBLISHED", "ARCHIVED"];
export declare class AssignmentListQueryDto {
    courseId?: string;
    status?: string;
}
export declare class CreateAssignmentDto {
    courseId: string;
    moduleId: string;
    title: string;
    description?: string;
    instructions: string;
    dueAt?: string;
    maxMarks: number;
}
export declare class UpdateAssignmentDto {
    title?: string;
    description?: string;
    instructions?: string;
    dueAt?: string;
    maxMarks?: number;
}
export declare class SubmitAssignmentDto {
    submissionText: string;
    attachmentUrl?: string;
}
export declare class GradeAssignmentSubmissionDto {
    grade: number;
    feedback?: string;
}
export declare const LMS_ASSESSMENT_TYPES: readonly ["PRACTICE_QUIZ", "FORMATIVE", "SUMMATIVE", "ASSIGNMENT", "PROJECT", "VIVA", "PRACTICAL"];
export declare const LMS_QUESTION_TYPES: readonly ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_TEXT", "NUMERIC"];
export declare class CreateAssessmentDto {
    courseId: string;
    moduleId: string;
    title: string;
    description?: string;
    assessmentType: string;
    totalMarks?: number;
    passingMarks?: number;
    durationMinutes?: number;
    attemptLimit?: number;
}
export declare class UpdateAssessmentDto {
    title?: string;
    description?: string;
    totalMarks?: number;
    passingMarks?: number;
    durationMinutes?: number;
    attemptLimit?: number;
}
export declare class CreateAssessmentOptionDto {
    value: string;
    label: string;
    isCorrect: boolean;
}
export declare class CreateAssessmentQuestionDto {
    prompt: string;
    questionType: string;
    marks: number;
    sequence: number;
    options: CreateAssessmentOptionDto[];
}
export declare class UpdateAssessmentQuestionDto {
    prompt?: string;
    marks?: number;
    sequence?: number;
    options?: CreateAssessmentOptionDto[];
}
export declare class AssessmentAnswerDto {
    questionId: string;
    answer: Record<string, unknown>;
}
export declare class SubmitAssessmentAttemptDto {
    answers: AssessmentAnswerDto[];
}
