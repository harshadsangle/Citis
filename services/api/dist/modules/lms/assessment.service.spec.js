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
    strict_1.default.deepEqual(score({ ...base, question_type: "NUMERIC", options: [{ value: "0", is_correct: true }] }, { answer: { value: "" } }), { correct: false, awardedMarks: 0 });
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
    strict_1.default.throws(() => validateOptions("SINGLE_CHOICE", [
        { value: " ", label: "Blank value", isCorrect: true },
        { value: "b", label: "B", isCorrect: false },
    ]), common_1.BadRequestException);
});
(0, node_test_1.default)("assessment listing honors status and denies unsupported roles", async () => {
    let listingQuery;
    const administrator = {
        ...learner,
        id: "administrator-1",
        roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
        permissions: ["lms.assessment.view"],
    };
    const service = serviceWith(async (text, values) => {
        if (text.startsWith("SELECT a.id")) {
            listingQuery = { text, values };
            return {
                rows: [{
                        id: "assessment-1",
                        tenant_id: administrator.tenantId,
                        institution_id: "institution-1",
                        campus_id: "campus-1",
                        status: "DRAFT",
                    }],
            };
        }
        return { rows: [] };
    });
    const result = await service.listAssessments(administrator, 1, 25, 0, { status: "DRAFT" });
    strict_1.default.equal(result.data.length, 1);
    strict_1.default.match(listingQuery?.text ?? "", /a\.status = \$2/);
    strict_1.default.deepEqual(listingQuery?.values, [administrator.tenantId, "DRAFT"]);
    let unsupportedRoleQueries = 0;
    const unsupportedRoleService = serviceWith(async () => {
        unsupportedRoleQueries += 1;
        return { rows: [] };
    });
    const unsupportedRole = {
        ...learner,
        roles: [{ code: "REPORT_VIEWER", name: "Report Viewer" }],
        permissions: ["lms.assessment.view"],
    };
    const restricted = await unsupportedRoleService.listAssessments(unsupportedRole, 1, 25, 0, {});
    strict_1.default.deepEqual(restricted.data, []);
    strict_1.default.equal(unsupportedRoleQueries, 0);
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
            if (text.startsWith("SELECT 1 FROM lms_enrollments"))
                return { rows: [{ id: "enrollment-1" }] };
            if (text.startsWith("SELECT q.id"))
                return { rows: [{ id: "q-1", tenant_id: learner.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-1", prompt: "Pick one", question_type: "SINGLE_CHOICE", marks: "2", sequence: 1, status: "ACTIVE", option_id: "o-1", option_value: "yes", option_label: "Yes", option_sequence: 1, is_correct: true }] };
            return { rows: [] };
        },
        transaction: async (work) => work({
            query: async (text, values) => {
                if (text.startsWith("SELECT * FROM lms_assessment_attempts"))
                    return { rows: [{ id: "attempt-1", status: "IN_PROGRESS" }] };
                if (text.startsWith("SELECT 1 FROM lms_enrollments"))
                    return { rows: [{ id: "enrollment-1" }] };
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
(0, node_test_1.default)("manual assessment submission remains pending and does not create a completion", async () => {
    let updatedParameters = [];
    let completionWrites = 0;
    const db = {
        query: async (text) => {
            if (text.startsWith("SELECT at.*"))
                return { rows: [{ id: "attempt-2", tenant_id: learner.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-2", learner_id: learner.id, status: "IN_PROGRESS", assessment_type: "PROJECT", assessment_status: "PUBLISHED", course_status: "PUBLISHED", module_status: "PUBLISHED", passing_marks: "2" }] };
            if (text.startsWith("SELECT 1 FROM lms_enrollments"))
                return { rows: [{ id: "enrollment-1" }] };
            if (text.startsWith("SELECT q.id"))
                return { rows: [{ id: "q-2", tenant_id: learner.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-2", prompt: "Build the prototype", question_type: "SHORT_TEXT", marks: "4", sequence: 1, status: "ACTIVE", option_id: "o-2", option_value: "prototype", option_label: "Prototype", option_sequence: 1, is_correct: true }] };
            return { rows: [] };
        },
        transaction: async (work) => work({
            query: async (text, values) => {
                if (text.startsWith("SELECT * FROM lms_assessment_attempts"))
                    return { rows: [{ id: "attempt-2", status: "IN_PROGRESS" }] };
                if (text.startsWith("SELECT 1 FROM lms_enrollments"))
                    return { rows: [{ id: "enrollment-1" }] };
                if (text.startsWith("UPDATE lms_assessment_attempts")) {
                    updatedParameters = values || [];
                    return { rows: [{ id: "attempt-2", status: "SUBMITTED", score: 0, max_score: 4, passed: null, grading_status: "PENDING" }] };
                }
                if (text.startsWith("INSERT INTO lms_assessment_completions")) {
                    completionWrites += 1;
                    return { rows: [] };
                }
                return { rows: [] };
            },
        }),
    };
    const service = new assessment_service_1.AssessmentService(db, { record: async () => undefined });
    const result = await service.submitAttempt("attempt-2", { answers: [{ questionId: "q-2", answer: { value: "A prototype" } }] }, request);
    strict_1.default.equal(result.grading_status, "PENDING");
    strict_1.default.equal(result.score, 0);
    strict_1.default.equal(updatedParameters[5], "PENDING");
    strict_1.default.equal(completionWrites, 0);
});
(0, node_test_1.default)("scoped instructor grading creates the completion once and rejects a second grade", async () => {
    let completionWrites = 0;
    let auditWrites = 0;
    let currentStatus = "PENDING";
    const staff = {
        ...learner,
        id: "teacher-1",
        roles: [{ code: "TEACHER", name: "Teacher" }],
        permissions: ["lms.assessment_attempt.view", "lms.assessment_attempt.update"],
    };
    const staffRequest = { context: { ...request.context, user: staff } };
    const db = {
        query: async (text) => {
            if (text.startsWith("SELECT at.*"))
                return { rows: [{ id: "attempt-3", tenant_id: staff.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-3", learner_id: "learner-1", status: "SUBMITTED", grading_status: currentStatus, assessment_type: "PRACTICAL", assessment_status: "PUBLISHED", course_status: "PUBLISHED", module_status: "PUBLISHED", passing_marks: "3", course_institution_id: "institution-1", course_campus_id: "campus-1" }] };
            if (text.includes("FROM user_roles"))
                return { rows: [{ ok: 1 }] };
            if (text.startsWith("SELECT q.id"))
                return { rows: [{ id: "q-3", tenant_id: staff.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-3", prompt: "Demonstrate the skill", question_type: "SHORT_TEXT", marks: "5", sequence: 1, status: "ACTIVE", option_id: "o-3", option_value: "demo", option_label: "Demonstration", option_sequence: 1, is_correct: true }] };
            return { rows: [] };
        },
        transaction: async (work) => work({
            query: async (text) => {
                if (text.startsWith("SELECT * FROM lms_assessment_attempts"))
                    return { rows: [{ id: "attempt-3", status: "SUBMITTED", grading_status: currentStatus }] };
                if (text.startsWith("SELECT question_id, answer_json"))
                    return { rows: [{ question_id: "q-3", answer_json: "demo" }] };
                if (text.startsWith("UPDATE lms_assessment_answers"))
                    return { rows: [{ question_id: "q-3", answer_json: "demo", awarded_marks: 4 }] };
                if (text.startsWith("UPDATE lms_assessment_attempts")) {
                    currentStatus = "GRADED";
                    return { rows: [{ id: "attempt-3", status: "SUBMITTED", grading_status: "GRADED", score: 4, max_score: 5, passed: true }] };
                }
                if (text.startsWith("INSERT INTO lms_assessment_completions")) {
                    completionWrites += 1;
                    return { rows: [{ id: "completion-3" }] };
                }
                return { rows: [] };
            },
        }),
    };
    const audit = { record: async () => { auditWrites += 1; } };
    const service = new assessment_service_1.AssessmentService(db, audit);
    const result = await service.gradeAttempt("attempt-3", { grades: [{ questionId: "q-3", awardedMarks: 4 }], feedback: "Good work." }, staffRequest);
    strict_1.default.equal(result.grading_status, "GRADED");
    strict_1.default.equal(result.score, 4);
    strict_1.default.equal(completionWrites, 1);
    strict_1.default.equal(auditWrites, 2);
    await strict_1.default.rejects(service.gradeAttempt("attempt-3", { grades: [{ questionId: "q-3", awardedMarks: 4 }] }, staffRequest), /no longer awaiting grading/);
});
//# sourceMappingURL=assessment.service.spec.js.map