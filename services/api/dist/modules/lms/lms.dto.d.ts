export declare const LMS_STATUSES: readonly ["DRAFT", "PUBLISHED", "ARCHIVED"];
export declare const LMS_RESOURCE_TYPES: readonly ["VIDEO", "PDF", "DOCUMENT", "PRESENTATION", "LINK", "SCORM", "INTERACTIVE"];
export declare class ContentListQueryDto {
    status?: string;
}
export declare class CreateProgrammeDto {
    institutionId: string;
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
