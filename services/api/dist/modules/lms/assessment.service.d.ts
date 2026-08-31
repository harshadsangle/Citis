import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { AuditService } from "../../common/audit.service";
import { DatabaseService } from "../../database/database.service";
import type { AssignmentListQueryDto, CreateAssessmentDto, CreateAssessmentQuestionDto, CreateAssessmentOptionDto, SubmitAssessmentAttemptDto, UpdateAssessmentDto, UpdateAssessmentQuestionDto } from "./lms.dto";
type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export declare class AssessmentService {
    private readonly db;
    private readonly audit;
    constructor(db: DatabaseService, audit: AuditService);
    private courseFor;
    private moduleFor;
    private hasStaffAccess;
    private assertStaff;
    private assessmentFor;
    private assertLearnerAccess;
    private auditMutation;
    private run;
    private validateAssessmentInput;
    listAssessments(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: AssignmentListQueryDto): Promise<{
        data: Record<string, unknown>[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAssessment(id: string, user: AuthenticatedUser): Promise<Record<string, unknown>>;
    createAssessment(input: CreateAssessmentDto, request: ContextRequest): Promise<Record<string, unknown>>;
    updateAssessment(id: string, input: UpdateAssessmentDto, request: ContextRequest): Promise<Record<string, unknown>>;
    changeAssessmentStatus(id: string, status: AssessmentStatus, request: ContextRequest): Promise<Record<string, unknown>>;
    private validateOptions;
    private questionFor;
    private questionRows;
    listQuestions(assessmentId: string, user: AuthenticatedUser): Promise<Record<string, unknown>[]>;
    createQuestion(assessmentId: string, input: CreateAssessmentQuestionDto, request: ContextRequest): Promise<{
        options: CreateAssessmentOptionDto[];
    }>;
    updateQuestion(id: string, input: UpdateAssessmentQuestionDto, request: ContextRequest): Promise<Record<string, unknown>>;
    archiveQuestion(id: string, request: ContextRequest): Promise<Record<string, unknown>>;
    private attemptFor;
    startAttempt(assessmentId: string, request: ContextRequest): Promise<{
        assessment: {
            id: unknown;
            title: unknown;
            assessment_type: unknown;
            duration_minutes: unknown;
            attempt_limit: unknown;
        };
        questions: Record<string, unknown>[];
    }>;
    getAttempt(id: string, user: AuthenticatedUser): Promise<{
        questions: Record<string, unknown>[];
        answers: Record<string, unknown>[];
    }>;
    private scoreQuestion;
    submitAttempt(id: string, input: SubmitAssessmentAttemptDto, request: ContextRequest): Promise<{
        results: {
            answer: Record<string, unknown>;
            correct: boolean;
            awardedMarks: number;
            questionId: string;
        }[];
    }>;
}
export {};
