"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const common_1 = require("@nestjs/common");
const assessment_service_1 = require("./assessment.service");
const learner = {
    id: "learner-1",
    tenantId: "tenant-1",
    email: "learner@example.com",
    firstName: "Learner",
    lastName: "One",
    roles: [{ code: "STUDENT", name: "Student" }],
    permissions: ["lms.assessment.view", "lms.assessment_attempt.create", "lms.assessment_attempt.update"],
    scopes: [{ institutionId: "institution-1", campusId: "campus-1" }],
};
function serviceWith(query) {
    const db = { query };
    const audit = { record: async () => undefined };
    return new assessment_service_1.AssessmentService(db, audit);
}
const request = {
    context: {
        requestId: "request-1",
        ipAddress: "127.0.0.1",
        userAgent: "test",
        user: learner,
    },
};
(0, node_test_1.default)("assessment scoring supports single, multiple, numeric, and text answers", () => {
    const service = serviceWith(async () => ({ rows: [] }));
    const score = service.scoreQuestion.bind(service);
    const base = { id: "q-1", marks: 2, options: [{ value: "a", is_correct: true }, { value: "b", is_correct: false }] };
    strict_1.default.deepEqual(score({ ...base, question_type: "SINGLE_CHOICE" }, { answer: { value: "a" } }), { correct: true, awardedMarks: 2 });
    strict_1.default.deepEqual(score({ ...base, question_type: "SHORT_TEXT" }, { answer: { value: "A" } }), { correct: true, awardedMarks: 2 });
    strict_1.default.deepEqual(score({ ...base, question_type: "NUMERIC", options: [{ value: "42", is_correct: true }] }, { answer: { value: "42" } }), { correct: true, awardedMarks: 2 });
    strict_1.default.deepEqual(score({ ...base, question_type: "MULTIPLE_CHOICE", options: [{ value: "a", is_correct: true }, { value: "b", is_correct: true }] }, { answer: { value: ["a", "b"] } }), { correct: true, awardedMarks: 2 });
    strict_1.default.deepEqual(score({ ...base, question_type: "SINGLE_CHOICE" }, { answer: { value: "b" } }), { correct: false, awardedMarks: 0 });
});
(0, node_test_1.default)("assessment authoring rejects invalid choice answer keys", () => {
    const service = serviceWith(async () => ({ rows: [] }));
    const validateOptions = service.validateOptions.bind(service);
    strict_1.default.throws(() => validateOptions("SINGLE_CHOICE", [
        { value: "a", label: "A", isCorrect: true },
        { value: "b", label: "B", isCorrect: true },
    ]), common_1.BadRequestException);
    strict_1.default.throws(() => validateOptions("TRUE_FALSE", [
        { value: "yes", label: "Yes", isCorrect: true },
        { value: "no", label: "No", isCorrect: false },
    ]), common_1.BadRequestException);
});
(0, node_test_1.default)("assessment reads reject a different institution before returning data", async () => {
    const service = serviceWith(async (text) => {
        if (text.startsWith("SELECT a.*")) {
            return { rows: [{
                        id: "assessment-2",
                        tenant_id: learner.tenantId,
                        institution_id: "institution-2",
                        campus_id: "campus-2",
                        course_id: "course-2",
                        module_id: "module-2",
                        status: "PUBLISHED",
                        course_status: "PUBLISHED",
                        module_status: "PUBLISHED",
                    }] };
        }
        return { rows: [] };
    });
    await strict_1.default.rejects(service.getAssessment("assessment-2", learner), common_1.NotFoundException);
});
(0, node_test_1.default)("starting an assessment is idempotent while an attempt is in progress", async () => {
    let createAttempt = false;
    const existingAttempt = { id: "attempt-1", status: "IN_PROGRESS", attempt_number: 1, assessment_id: "assessment-1", learner_id: learner.id, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1" };
    const db = {
        query: async (text) => {
            if (text.startsWith("SELECT a.*"))
                return { rows: [{ id: "assessment-1", tenant_id: learner.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", status: "PUBLISHED", assessment_type: "PRACTICE_QUIZ", course_status: "PUBLISHED", module_status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE", attempt_limit: 1 }] };
            if (text.startsWith("SELECT 1 FROM lms_enrollments"))
                return { rows: [{ id: "enrollment-1" }] };
            return { rows: [] };
        },
        transaction: async (work) => work({
            query: async (text) => {
                if (text.startsWith("SELECT * FROM lms_assessment_attempts"))
                    return { rows: [existingAttempt] };
                if (text.startsWith("SELECT q.id"))
                    return { rows: [{ id: "q-1", tenant_id: learner.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-1", prompt: "Pick one", question_type: "SINGLE_CHOICE", marks: "1", sequence: 1, status: "ACTIVE", option_id: "o-1", option_value: "yes", option_label: "Yes", option_sequence: 1 }] };
                if (text.startsWith("INSERT INTO lms_assessment_attempts")) {
                    createAttempt = true;
                    return { rows: [existingAttempt] };
                }
                return { rows: [] };
            },
        }),
    };
    const service = new assessment_service_1.AssessmentService(db, { record: async () => undefined });
    const result = await service.startAttempt("assessment-1", request);
    strict_1.default.equal(result.id, "attempt-1");
    strict_1.default.equal(createAttempt, false);
    strict_1.default.equal(result.questions.length, 1);
});
(0, node_test_1.default)("attempt submission calculates the score server-side and writes a completion", async () => {
    let updatedParameters = [];
    const db = {
        query: async (text) => {
            if (text.startsWith("SELECT at.*"))
                return { rows: [{ id: "attempt-1", tenant_id: learner.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-1", learner_id: learner.id, status: "IN_PROGRESS", assessment_type: "PRACTICE_QUIZ", assessment_status: "PUBLISHED", course_status: "PUBLISHED", module_status: "PUBLISHED", passing_marks: "1" }] };
            if (text.startsWith("SELECT q.id"))
                return { rows: [{ id: "q-1", tenant_id: learner.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-1", prompt: "Pick one", question_type: "SINGLE_CHOICE", marks: "2", sequence: 1, status: "ACTIVE", option_id: "o-1", option_value: "yes", option_label: "Yes", option_sequence: 1, is_correct: true }] };
            return { rows: [] };
        },
        transaction: async (work) => work({
            query: async (text, values) => {
                if (text.startsWith("SELECT * FROM lms_assessment_attempts"))
                    return { rows: [{ id: "attempt-1", status: "IN_PROGRESS" }] };
                if (text.startsWith("UPDATE lms_assessment_attempts")) {
                    updatedParameters = values || [];
                    return { rows: [{ id: "attempt-1", status: "SUBMITTED", score: 2, max_score: 2, passed: true }] };
                }
                if (text.startsWith("INSERT INTO lms_assessment_completions"))
                    return { rows: [{ id: "completion-1", passed: true }] };
                return { rows: [] };
            },
        }),
    };
    const service = new assessment_service_1.AssessmentService(db, { record: async () => undefined });
    const result = await service.submitAttempt("attempt-1", { answers: [{ questionId: "q-1", answer: { value: "yes" } }] }, request);
    strict_1.default.equal(result.score, 2);
    strict_1.default.equal(result.results[0].correct, true);
    strict_1.default.equal(updatedParameters[2], 2);
});
//# sourceMappingURL=assessment.service.spec.js.map