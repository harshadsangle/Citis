import { AuditService } from "../../common/audit.service";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type { ContentListQueryDto, CreateCourseDto, CreateCourseModuleDto, CreateLearningResourceDto, CreateLessonDto, CreateProgrammeDto, UpdateCourseDto, UpdateCourseModuleDto, UpdateLearningResourceDto, UpdateLessonDto, UpdateProgrammeDto } from "./lms.dto";
type LmsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type LmsTable = "programmes" | "courses" | "course_modules" | "lessons" | "learning_resources";
export declare class LmsService {
    private readonly db;
    private readonly audit;
    constructor(db: DatabaseService, audit: AuditService);
    private statusFilter;
    private run;
    private institutionFor;
    private auditMutation;
    listProgrammes(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto): Promise<{
        data: import("pg").QueryResultRow[];
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
        data: import("pg").QueryResultRow[];
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
        data: import("pg").QueryResultRow[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    listLessons(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto, moduleId?: string): Promise<{
        data: import("pg").QueryResultRow[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    listResources(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto, lessonId?: string): Promise<{
        data: import("pg").QueryResultRow[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    private listChild;
    getChild(id: string, table: LmsTable, user: AuthenticatedUser): Promise<import("pg").QueryResultRow>;
    createCourseModule(input: CreateCourseModuleDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    updateCourseModule(id: string, input: UpdateCourseModuleDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    createLesson(input: CreateLessonDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    updateLesson(id: string, input: UpdateLessonDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    createLearningResource(input: CreateLearningResourceDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    updateLearningResource(id: string, input: UpdateLearningResourceDto, request: ContextRequest): Promise<import("pg").QueryResultRow>;
    private assertParent;
    private createChild;
    private updateChild;
    private validateResource;
    changeStatus(id: string, kind: "programme" | "course" | "course_module" | "lesson" | "learning_resource", status: LmsStatus, request: ContextRequest): Promise<import("pg").QueryResultRow>;
}
export {};
