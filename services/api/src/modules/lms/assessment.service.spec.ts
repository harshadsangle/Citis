import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser } from "../../common/request-context";
import { AssessmentService } from "./assessment.service";

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
