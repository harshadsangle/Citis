import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { AuditService } from "../../common/audit.service";
import { DatabaseService } from "../../database/database.service";
import type { AssessmentAttemptListQueryDto, AssignmentListQueryDto, CreateAssessmentDto, CreateAssessmentQuestionDto, CreateAssessmentOptionDto, GradeAssessmentAttemptDto, SaveAssessmentDraftDto, SubmitAssessmentAttemptDto, UpdateAssessmentDto, UpdateAssessmentQuestionDto, UpdateAssessmentOptionDto } from "./lms.dto";
import { CertificateService } from "./certificate.service";
type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export declare class AssessmentService {
    private readonly db;
    private readonly audit;
    private readonly certificates?;
    constructor(db: DatabaseService, audit: AuditService, certificates?: CertificateService | undefined);
    private courseFor;
    private moduleFor;
    private hasStaffAccess;
    private assertStaff;
    private assessmentFor;
    private assertLearnerAccess;
    private assertActiveEnrollmentForAttempt;
    private auditMutation;
    private run;
    private validateAssessmentInput;
    private validateAssessmentMarks;
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
    private snapshotQuestions;
    private questionsForAttempt;
    private publicAttempt;
    private draftRows;
    listQuestions(assessmentId: string, user: AuthenticatedUser): Promise<Record<string, unknown>[]>;
    createQuestion(assessmentId: string, input: CreateAssessmentQuestionDto, request: ContextRequest): Promise<{
        options: CreateAssessmentOptionDto[];
    }>;
    updateQuestion(id: string, input: UpdateAssessmentQuestionDto, request: ContextRequest): Promise<Record<string, unknown>>;
    archiveQuestion(id: string, request: ContextRequest): Promise<Record<string, unknown>>;
    private optionFor;
    private allOptions;
    createOption(questionId: string, input: CreateAssessmentOptionDto, request: ContextRequest): Promise<Record<string, unknown>>;
    updateOption(id: string, input: UpdateAssessmentOptionDto, request: ContextRequest): Promise<Record<string, unknown>>;
    archiveOption(id: string, request: ContextRequest): Promise<{
        status: string;
    }>;
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
        draft_answers: Record<string, unknown>[];
    }>;
    getAttempt(id: string, user: AuthenticatedUser): Promise<{
        questions: Record<string, unknown>[];
        answers: Record<string, unknown>[];
        draft_answers: Record<string, unknown>[];
    }>;
    saveDraft(id: string, input: SaveAssessmentDraftDto, request: ContextRequest): Promise<{
        attemptId: string;
        saved: number;
    }>;
    listAttempts(assessmentId: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: AssessmentAttemptListQueryDto): Promise<{
        data: Record<string, unknown>[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    listLearnerHistory(user: AuthenticatedUser, page: number, pageSize: number, offset: number): Promise<{
        data: Record<string, unknown>[];
        meta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    private scoreQuestion;
    submitAttempt(id: string, input: SubmitAssessmentAttemptDto, request: ContextRequest): Promise<{
        results: ({
            answer: Record<string, unknown>;
            correct: boolean;
            awardedMarks: number;
            questionId: string;
        } | {
            answer: Record<string, unknown>;
            correct: null;
            awardedMarks: number;
            questionId: string;
        })[];
        expired?: undefined;
        attempt?: undefined;
    }>;
    gradeAttempt(id: string, input: GradeAssessmentAttemptDto, request: ContextRequest): Promise<{
        results: Record<string, unknown>[];
    }>;
}
export {};
