import type { Response } from "express";
import type { ContextRequest } from "../../common/request-context";
import { ContentListQueryDto, CandidateListQueryDto, AssignInstructorDto, AssignmentListQueryDto, CompleteAssessmentDto, CreateCourseDto, CreateCourseModuleDto, CreateLearningResourceDto, CreateLessonDto, CreateProgrammeDto, CreateAssignmentDto, EnrollLearnerDto, GradeAssignmentSubmissionDto, ProgressViewerQueryDto, RelationshipListQueryDto, SubmitAssignmentDto, UpdateAssignmentDto, UpdateCourseDto, UpdateCourseModuleDto, UpdateLearningResourceDto, UpdateLessonDto, UpdateProgrammeDto } from "./lms.dto";
import { LmsService } from "./lms.service";
import type { LmsUpload } from "./resource-storage.service";
export declare class LmsController {
    private readonly lms;
    constructor(lms: LmsService);
    programmes(request: ContextRequest, query: ContentListQueryDto): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    createProgramme(input: CreateProgrammeDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    programme(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    updateProgramme(id: string, input: UpdateProgrammeDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    publishProgramme(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    archiveProgramme(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    courses(request: ContextRequest, programmeId: string | undefined, query: ContentListQueryDto): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
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
    assignments(request: ContextRequest, query: AssignmentListQueryDto): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    createAssignment(input: CreateAssignmentDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    assignment(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    updateAssignment(id: string, input: UpdateAssignmentDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    publishAssignment(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    archiveAssignment(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    assignmentSubmissions(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    myAssignmentSubmission(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    submitAssignment(id: string, input: SubmitAssignmentDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    gradeAssignmentSubmission(id: string, submissionId: string, input: GradeAssignmentSubmissionDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    learnerProgress(request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        course: {
            id: unknown;
            title: unknown;
            code: unknown;
            description: unknown;
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
        }[];
    }[]>>;
    courseProgress(courseId: string, request: ContextRequest, query: ProgressViewerQueryDto): Promise<import("../../common/response").ApiSuccess<{
        course: {
            id: unknown;
            title: unknown;
            code: unknown;
            description: unknown;
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
        }[];
    }>>;
    completeLesson(lessonId: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    completeAssessment(input: CompleteAssessmentDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<Record<string, unknown>>>;
    courseModules(request: ContextRequest, courseId: string | undefined, query: ContentListQueryDto): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    createCourseModule(input: CreateCourseModuleDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    courseModule(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    updateCourseModule(id: string, input: UpdateCourseModuleDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    publishCourseModule(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    archiveCourseModule(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    lessons(request: ContextRequest, moduleId: string | undefined, query: ContentListQueryDto): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    createLesson(input: CreateLessonDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    lesson(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    updateLesson(id: string, input: UpdateLessonDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    publishLesson(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    archiveLesson(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    learningResources(request: ContextRequest, lessonId: string | undefined, query: ContentListQueryDto): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow[]>>;
    createLearningResource(input: CreateLearningResourceDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
    learningResource(id: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<import("pg").QueryResultRow>>;
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
