import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser } from "../../common/request-context";
import { AssessmentService } from "./assessment.service";
import type { ContextRequest } from "../../common/request-context";

const learner: AuthenticatedUser = {
  id: "learner-1",
  tenantId: "tenant-1",
  email: "learner@example.com",
  firstName: "Learner",
  lastName: "One",
  roles: [{ code: "STUDENT", name: "Student" }],
  permissions: ["lms.assessment.view", "lms.assessment_attempt.create", "lms.assessment_attempt.update"],
  scopes: [{ institutionId: "institution-1", campusId: "campus-1" }],
};

function serviceWith(query: (text: string, values?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>) {
  const db = { query };
  const audit = { record: async () => undefined };
  return new AssessmentService(db as never, audit as never);
}

const request = {
  context: {
    requestId: "request-1",
    ipAddress: "127.0.0.1",
    userAgent: "test",
    user: learner,
  },
} as unknown as ContextRequest;

test("assessment scoring supports single, multiple, numeric, and text answers", () => {
  const service = serviceWith(async () => ({ rows: [] }));
  const score = (service as unknown as { scoreQuestion: (question: Record<string, unknown>, answer: unknown) => { correct: boolean; awardedMarks: number } }).scoreQuestion.bind(service);
  const base = { id: "q-1", marks: 2, options: [{ value: "a", is_correct: true }, { value: "b", is_correct: false }] };

  assert.deepEqual(score({ ...base, question_type: "SINGLE_CHOICE" }, { answer: { value: "a" } }), { correct: true, awardedMarks: 2 });
  assert.deepEqual(score({ ...base, question_type: "SHORT_TEXT" }, { answer: { value: "A" } }), { correct: true, awardedMarks: 2 });
  assert.deepEqual(score({ ...base, question_type: "NUMERIC", options: [{ value: "42", is_correct: true }] }, { answer: { value: "42" } }), { correct: true, awardedMarks: 2 });
  assert.deepEqual(score({ ...base, question_type: "MULTIPLE_CHOICE", options: [{ value: "a", is_correct: true }, { value: "b", is_correct: true }] }, { answer: { value: ["a", "b"] } }), { correct: true, awardedMarks: 2 });
  assert.deepEqual(score({ ...base, question_type: "SINGLE_CHOICE" }, { answer: { value: "b" } }), { correct: false, awardedMarks: 0 });
});

test("assessment authoring rejects invalid choice answer keys", () => {
  const service = serviceWith(async () => ({ rows: [] }));
  const validateOptions = (service as unknown as { validateOptions: (type: string, options: Array<{ value: string; label: string; isCorrect: boolean }>) => void }).validateOptions.bind(service);

  assert.throws(() => validateOptions("SINGLE_CHOICE", [
    { value: "a", label: "A", isCorrect: true },
    { value: "b", label: "B", isCorrect: true },
  ]), BadRequestException);
  assert.throws(() => validateOptions("TRUE_FALSE", [
    { value: "yes", label: "Yes", isCorrect: true },
    { value: "no", label: "No", isCorrect: false },
  ]), BadRequestException);
});

test("assessment reads reject a different institution before returning data", async () => {
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

  await assert.rejects(service.getAssessment("assessment-2", learner), NotFoundException);
});

test("starting an assessment is idempotent while an attempt is in progress", async () => {
  let createAttempt = false;
  const existingAttempt = { id: "attempt-1", status: "IN_PROGRESS", attempt_number: 1, assessment_id: "assessment-1", learner_id: learner.id, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1" };
  const db = {
    query: async (text: string) => {
      if (text.startsWith("SELECT a.*")) return { rows: [{ id: "assessment-1", tenant_id: learner.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", status: "PUBLISHED", assessment_type: "PRACTICE_QUIZ", course_status: "PUBLISHED", module_status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE", attempt_limit: 1 }] };
      if (text.startsWith("SELECT 1 FROM lms_enrollments")) return { rows: [{ id: "enrollment-1" }] };
      return { rows: [] };
    },
    transaction: async (work: (client: { query: (text: string, values?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }> }) => Promise<unknown>) => work({
      query: async (text: string) => {
        if (text.startsWith("SELECT * FROM lms_assessment_attempts")) return { rows: [existingAttempt] };
        if (text.startsWith("SELECT q.id")) return { rows: [{ id: "q-1", tenant_id: learner.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-1", prompt: "Pick one", question_type: "SINGLE_CHOICE", marks: "1", sequence: 1, status: "ACTIVE", option_id: "o-1", option_value: "yes", option_label: "Yes", option_sequence: 1 }] };
        if (text.startsWith("INSERT INTO lms_assessment_attempts")) {
          createAttempt = true;
          return { rows: [existingAttempt] };
        }
        return { rows: [] };
      },
    }),
  };
  const service = new AssessmentService(db as never, { record: async () => undefined } as never);

  const result = await service.startAttempt("assessment-1", request) as unknown as { id: string; questions: Array<Record<string, unknown>> };

  assert.equal(result.id, "attempt-1");
  assert.equal(createAttempt, false);
  assert.equal(result.questions.length, 1);
});

test("attempt submission calculates the score server-side and writes a completion", async () => {
  let updatedParameters: unknown[] = [];
  const db = {
    query: async (text: string) => {
      if (text.startsWith("SELECT at.*")) return { rows: [{ id: "attempt-1", tenant_id: learner.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-1", learner_id: learner.id, status: "IN_PROGRESS", assessment_type: "PRACTICE_QUIZ", assessment_status: "PUBLISHED", course_status: "PUBLISHED", module_status: "PUBLISHED", passing_marks: "1" }] };
      if (text.startsWith("SELECT q.id")) return { rows: [{ id: "q-1", tenant_id: learner.tenantId, institution_id: "institution-1", campus_id: "campus-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-1", prompt: "Pick one", question_type: "SINGLE_CHOICE", marks: "2", sequence: 1, status: "ACTIVE", option_id: "o-1", option_value: "yes", option_label: "Yes", option_sequence: 1, is_correct: true }] };
      return { rows: [] };
    },
    transaction: async (work: (client: { query: (text: string, values?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }> }) => Promise<unknown>) => work({
      query: async (text: string, values?: unknown[]) => {
        if (text.startsWith("SELECT * FROM lms_assessment_attempts")) return { rows: [{ id: "attempt-1", status: "IN_PROGRESS" }] };
        if (text.startsWith("UPDATE lms_assessment_attempts")) {
          updatedParameters = values || [];
          return { rows: [{ id: "attempt-1", status: "SUBMITTED", score: 2, max_score: 2, passed: true }] };
        }
        if (text.startsWith("INSERT INTO lms_assessment_completions")) return { rows: [{ id: "completion-1", passed: true }] };
        return { rows: [] };
      },
    }),
  };
  const service = new AssessmentService(db as never, { record: async () => undefined } as never);

  const result = await service.submitAttempt("attempt-1", { answers: [{ questionId: "q-1", answer: { value: "yes" } }] }, request) as unknown as { score: number; results: Array<{ correct: boolean }> };

  assert.equal(result.score, 2);
  assert.equal(result.results[0].correct, true);
  assert.equal(updatedParameters[2], 2);
});
