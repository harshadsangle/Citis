import type { Response } from "express";
import type { ContextRequest } from "../../common/request-context";
import { ContentListQueryDto, CandidateListQueryDto, AssignInstructorDto, AssignmentListQueryDto, CreateAssessmentDto, CreateAssessmentQuestionDto, CreateAssessmentOptionDto, CreateCourseDto, CreateCourseModuleDto, CreateLearningResourceDto, CreateLessonDto, CreateProgrammeDto, CreateAssignmentDto, AssessmentAttemptListQueryDto, EnrollLearnerDto, SaveAssessmentDraftDto, GradeAssessmentAttemptDto, GradeAssignmentSubmissionDto, ProgressViewerQueryDto, RelationshipListQueryDto, SubmitAssignmentDto, SubmitAssessmentAttemptDto, UpdateAssessmentDto, UpdateAssessmentQuestionDto, UpdateAssessmentOptionDto, UpdateAssignmentDto, UpdateCourseDto, UpdateCourseModuleDto, UpdateLearningResourceDto, UpdateLessonDto, UpdateProgrammeDto } from "./lms.dto";
import { LmsService } from "./lms.service";
import { AssessmentService } from "./assessment.service";
import type { LmsUpload } from "./resource-storage.service";
export declare class LmsController {
    private readonly lms;
    private readonly assessments;
    constructor(lms: LmsService, assessments: AssessmentService);
    programmes(request: ContextRequest, query: ContentListQueryDto): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>[]>>;
    createProgramme(input: CreateProgrammeDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    programme(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    updateProgramme(id: string, input: UpdateProgrammeDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    publishProgramme(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    archiveProgramme(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    courses(request: ContextRequest, programmeId: string | undefined, query: ContentListQueryDto): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>[]>>;
    createCourse(input: CreateCourseDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    course(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    updateCourse(id: string, input: UpdateCourseDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    publishCourse(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    archiveCourse(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    enrollmentCandidates(id: string, request: ContextRequest, query: CandidateListQueryDto): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    enrollments(id: string, request: ContextRequest, query: RelationshipListQueryDto): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    enrollLearner(id: string, input: EnrollLearnerDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    removeEnrollment(courseId: string, enrollmentId: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    instructorCandidates(id: string, request: ContextRequest, query: CandidateListQueryDto): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    instructorAssignments(id: string, request: ContextRequest, query: RelationshipListQueryDto): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    assignInstructor(id: string, input: AssignInstructorDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    removeInstructorAssignment(courseId: string, assignmentId: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    assignments(request: ContextRequest, query: AssignmentListQueryDto): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>[]>>;
    createAssignment(input: CreateAssignmentDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    assignment(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    updateAssignment(id: string, input: UpdateAssignmentDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    publishAssignment(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    archiveAssignment(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    assignmentSubmissions(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    myAssignmentSubmission(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    submitAssignment(id: string, input: SubmitAssignmentDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    gradeAssignmentSubmission(id: string, submissionId: string, input: GradeAssignmentSubmissionDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    assessmentsList(request: ContextRequest, query: AssignmentListQueryDto): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>[]>>;
    createAssessment(input: CreateAssessmentDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    assessment(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    updateAssessment(id: string, input: UpdateAssessmentDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    publishAssessment(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    archiveAssessment(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    assessmentQuestions(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>[]>>;
    createAssessmentQuestion(id: string, input: CreateAssessmentQuestionDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        options: CreateAssessmentOptionDto[];
    }>>;
    updateAssessmentQuestion(id: string, input: UpdateAssessmentQuestionDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    archiveAssessmentQuestion(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    createAssessmentOption(id: string, input: CreateAssessmentOptionDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    updateAssessmentOption(id: string, input: UpdateAssessmentOptionDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    archiveAssessmentOption(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        status: string;
    }>>;
    startAssessmentAttempt(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        assessment: {
            id: unknown;
            title: unknown;
            assessment_type: unknown;
            duration_minutes: unknown;
            attempt_limit: unknown;
        };
        questions: Record<string, unknown>[];
        draft_answers: Record<string, unknown>[];
    }>>;
    assessmentAttempts(id: string, request: ContextRequest, query: AssessmentAttemptListQueryDto): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>[]>>;
    assessmentAttempt(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        questions: Record<string, unknown>[];
        answers: Record<string, unknown>[];
        draft_answers: Record<string, unknown>[];
    }>>;
    submitAssessmentAttempt(id: string, input: SubmitAssessmentAttemptDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
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
    }>>;
    saveAssessmentDraft(id: string, input: SaveAssessmentDraftDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        attemptId: string;
        saved: number;
    }>>;
    gradeAssessmentAttempt(id: string, input: GradeAssessmentAttemptDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        results: Record<string, unknown>[];
    }>>;
    assessmentHistory(request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>[]>>;
    learnerProgress(request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        course: {
            id: unknown;
            title: unknown;
            code: unknown;
            description: unknown;
            programme_name: unknown;
            status: unknown;
        };
        learnerId: string;
        state: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
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
            state: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
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
    }[]>>;
    courseProgress(courseId: string, request: ContextRequest, query: ProgressViewerQueryDto): Promise<import("../../common/response").ApiSuccess<{
        course: {
            id: unknown;
            title: unknown;
            code: unknown;
            description: unknown;
            programme_name: unknown;
            status: unknown;
        };
        learnerId: string;
        state: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
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
            state: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
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
    }>>;
    completeLesson(lessonId: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    courseModules(request: ContextRequest, courseId: string | undefined, query: ContentListQueryDto): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>[]>>;
    createCourseModule(input: CreateCourseModuleDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    courseModule(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        institution_id: string;
        campus_id: string | null;
    }>>;
    updateCourseModule(id: string, input: UpdateCourseModuleDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    publishCourseModule(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    archiveCourseModule(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    lessons(request: ContextRequest, moduleId: string | undefined, query: ContentListQueryDto): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>[]>>;
    createLesson(input: CreateLessonDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    lesson(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        institution_id: string;
        campus_id: string | null;
    }>>;
    updateLesson(id: string, input: UpdateLessonDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    publishLesson(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    archiveLesson(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    learningResources(request: ContextRequest, lessonId: string | undefined, query: ContentListQueryDto): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>[]>>;
    createLearningResource(input: CreateLearningResourceDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    learningResource(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        institution_id: string;
        campus_id: string | null;
    }>>;
    updateLearningResource(id: string, input: UpdateLearningResourceDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    publishLearningResource(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    archiveLearningResource(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    uploadLearningResourceFile(id: string, file: LmsUpload, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<any>>;
    uploadScormPackage(id: string, file: LmsUpload, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<any>>;
    downloadLearningResourceFile(id: string, request: ContextRequest, response: Response): Promise<Response<any, Record<string, any>>>;
    launchScorm(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        launchUrl: string;
    }>>;
    serveScormAsset(id: string, asset: string, request: ContextRequest, response: Response): Promise<Response<any, Record<string, any>>>;
}
