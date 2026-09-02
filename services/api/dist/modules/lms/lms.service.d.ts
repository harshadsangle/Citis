import { AuditService } from "../../common/audit.service";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import { ResourceStorageService, type LmsUpload } from "./resource-storage.service";
import { CertificateService } from "./certificate.service";
import type { ContentListQueryDto, CandidateListQueryDto, AssignInstructorDto, AssignmentListQueryDto, CreateCourseDto, CreateCourseModuleDto, CreateLearningResourceDto, CreateLessonDto, CreateProgrammeDto, CreateAssignmentDto, EnrollLearnerDto, GradeAssignmentSubmissionDto, RelationshipListQueryDto, SubmitAssignmentDto, UpdateAssignmentDto, UpdateCourseDto, UpdateCourseModuleDto, UpdateLearningResourceDto, UpdateLessonDto, UpdateProgrammeDto } from "./lms.dto";
type LmsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type LmsTable = "programmes" | "courses" | "course_modules" | "lessons" | "learning_resources";
type ProgressState = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export declare class LmsService {
    private readonly db;
    private readonly audit;
    private readonly storage;
    private readonly certificates?;
    constructor(db: DatabaseService, audit: AuditService, storage: ResourceStorageService, certificates?: CertificateService | undefined);
    private statusFilter;
    private run;
    private institutionFor;
    private campusFor;
    private auditMutation;
    private auditAccess;
    listProgrammes(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto): Promise<{
        data: Record<string, unknown>[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getProgramme(id: string, user: AuthenticatedUser): Promise<import("pg").QueryResultRow>;
    createProgramme(input: CreateProgrammeDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    updateProgramme(id: string, input: UpdateProgrammeDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    listCourses(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto, programmeId?: string): Promise<{
        data: Record<string, unknown>[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCourse(id: string, user: AuthenticatedUser): Promise<import("pg").QueryResultRow>;
    createCourse(input: CreateCourseDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    updateCourse(id: string, input: UpdateCourseDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    listCourseModules(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto, courseId?: string): Promise<{
        data: Record<string, unknown>[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    listLessons(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto, moduleId?: string): Promise<{
        data: Record<string, unknown>[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    listResources(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto, lessonId?: string): Promise<{
        data: Record<string, unknown>[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    private listChild;
    getChild(id: string, table: LmsTable, user: AuthenticatedUser): Promise<{
        institution_id: string;
        campus_id: string | null;
    }>;
    createCourseModule(input: CreateCourseModuleDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    updateCourseModule(id: string, input: UpdateCourseModuleDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    createLesson(input: CreateLessonDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    updateLesson(id: string, input: UpdateLessonDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    createLearningResource(input: CreateLearningResourceDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    updateLearningResource(id: string, input: UpdateLearningResourceDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    private resourceFor;
    uploadResourceFile(id: string, file: LmsUpload, request: ContextRequest): Promise<any>;
    uploadScormPackage(id: string, file: LmsUpload, request: ContextRequest): Promise<any>;
    private replaceManagedFile;
    getManagedFile(id: string, request: ContextRequest): Promise<{
        content: Buffer<ArrayBufferLike>;
        mimeType: unknown;
        filename: unknown;
    }>;
    getScormLaunch(id: string, request: ContextRequest): Promise<{
        launchUrl: string;
    }>;
    getScormAsset(id: string, assetPath: string, request: ContextRequest): Promise<{
        content: Buffer<ArrayBufferLike>;
        mimeType: string;
    }>;
    private assertParent;
    private contentScope;
    private createChild;
    private updateChild;
    private validateResource;
    private assertInstitutionAccess;
    private relationshipCourse;
    private relationshipStatus;
    private eligiblePerson;
    private listCandidates;
    listEnrollmentCandidates(courseId: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: CandidateListQueryDto): Promise<{
        data: import("pg").QueryResultRow[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    listInstructorCandidates(courseId: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: CandidateListQueryDto): Promise<{
        data: import("pg").QueryResultRow[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    private listRelationships;
    listEnrollments(courseId: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: RelationshipListQueryDto): Promise<{
        data: import("pg").QueryResultRow[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    listInstructorAssignments(courseId: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: RelationshipListQueryDto): Promise<{
        data: import("pg").QueryResultRow[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    private runRelationship;
    enrollLearner(courseId: string, input: EnrollLearnerDto, request: ContextRequest): Promise<Record<string, unknown>>;
    assignInstructor(courseId: string, input: AssignInstructorDto, request: ContextRequest): Promise<Record<string, unknown>>;
    private removeRelationship;
    removeEnrollment(courseId: string, enrollmentId: string, request: ContextRequest): Promise<Record<string, unknown>>;
    removeInstructorAssignment(courseId: string, assignmentId: string, request: ContextRequest): Promise<Record<string, unknown>>;
    private progressCourse;
    private activeEnrollment;
    private assertProgressViewer;
    private calculateCourseProgress;
    listLearnerProgress(user: AuthenticatedUser): Promise<{
        course: {
            id: unknown;
            title: unknown;
            code: unknown;
            description: unknown;
            programme_name: unknown;
            status: unknown;
        };
        learnerId: string;
        state: ProgressState;
        percentage: number;
        lessons: {
            completed: number;
            total: number;
        };
        assessments: {
            completed: number;
            total: number;
        };
        modules: {
            id: unknown;
            title: unknown;
            sequence: number;
            state: ProgressState;
            percentage: number;
            lessons: {
                completed: number;
                total: number;
            };
            assessments: {
                completed: number;
                total: number;
            };
            lessonItems: {
                id: string;
                title: string;
                description: string | null;
                sequence: number;
                estimatedDuration: number | null;
            }[];
        }[];
    }[]>;
    getCourseProgress(courseId: string, user: AuthenticatedUser, learnerId?: string): Promise<{
        course: {
            id: unknown;
            title: unknown;
            code: unknown;
            description: unknown;
            programme_name: unknown;
            status: unknown;
        };
        learnerId: string;
        state: ProgressState;
        percentage: number;
        lessons: {
            completed: number;
            total: number;
        };
        assessments: {
            completed: number;
            total: number;
        };
        modules: {
            id: unknown;
            title: unknown;
            sequence: number;
            state: ProgressState;
            percentage: number;
            lessons: {
                completed: number;
                total: number;
            };
            assessments: {
                completed: number;
                total: number;
            };
            lessonItems: {
                id: string;
                title: string;
                description: string | null;
                sequence: number;
                estimatedDuration: number | null;
            }[];
        }[];
    }>;
    completeLesson(lessonId: string, request: ContextRequest): Promise<Record<string, unknown>>;
    private assignmentCourse;
    private hasAssignmentStaffAccess;
    private assertAssignmentStaffAccess;
    private assignmentModule;
    private assignmentFor;
    private assertAssignmentViewer;
    listAssignments(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: AssignmentListQueryDto): Promise<{
        data: Record<string, unknown>[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAssignment(id: string, user: AuthenticatedUser): Promise<Record<string, unknown>>;
    createAssignment(input: CreateAssignmentDto, request: ContextRequest): Promise<Record<string, unknown>>;
    updateAssignment(id: string, input: UpdateAssignmentDto, request: ContextRequest): Promise<Record<string, unknown>>;
    changeAssignmentStatus(id: string, status: LmsStatus, request: ContextRequest): Promise<Record<string, unknown>>;
    listAssignmentSubmissions(id: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number): Promise<{
        data: import("pg").QueryResultRow[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyAssignmentSubmission(id: string, user: AuthenticatedUser): Promise<Record<string, unknown>>;
    submitAssignment(id: string, input: SubmitAssignmentDto, request: ContextRequest): Promise<Record<string, unknown>>;
    gradeAssignmentSubmission(id: string, submissionId: string, input: GradeAssignmentSubmissionDto, request: ContextRequest): Promise<Record<string, unknown>>;
    changeStatus(id: string, kind: "programme" | "course" | "course_module" | "lesson" | "learning_resource", status: LmsStatus, request: ContextRequest): Promise<import("pg").QueryResultRow>;
}
export {};
