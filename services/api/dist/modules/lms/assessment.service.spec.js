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
//# sourceMappingURL=assessment.service.spec.js.map