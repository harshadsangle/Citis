import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { LmsService } from "./lms.service";
import { ResourceStorageService } from "./resource-storage.service";

const user: AuthenticatedUser = {
  id: "user-1",
  tenantId: "tenant-1",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
  permissions: ["lms.course.create", "lms.learning_resource.create", "lms.course.publish"],
  scopes: [{ institutionId: "institution-1", campusId: null }],
};

const request = {
  context: {
    requestId: "request-1",
    ipAddress: "127.0.0.1",
    userAgent: "test",
    user,
  },
} as unknown as ContextRequest;

function serviceWith(query: (text: string, values: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>) {
  const audits: Array<Record<string, unknown>> = [];
  const db = { query };
  const audit = { record: async (input: Record<string, unknown>) => audits.push(input) };
  return { service: new LmsService(db as never, audit as never, new ResourceStorageService()), audits };
}

test("course creation rejects a parent outside the authenticated tenant", async () => {
  const { service } = serviceWith(async () => ({ rows: [] }));

  await assert.rejects(
    service.createCourse({
      programmeId: "programme-from-another-tenant",
      title: "Digital Skills",
      code: "DS-101",
    }, request),
    NotFoundException,
  );
});

test("learning resources enforce URL and file requirements before insertion", async () => {
  let insertAttempted = false;
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT id FROM lessons")) return { rows: [{ id: "lesson-1" }] };
    insertAttempted = true;
    return { rows: [] };
  });

  await assert.rejects(
    service.createLearningResource({
      lessonId: "lesson-1",
      resourceType: "VIDEO",
      title: "Intro video",
      sequence: 1,
    }, request),
    BadRequestException,
  );
  assert.equal(insertAttempted, false);
});

test("publishing content writes an auditable status mutation", async () => {
  const { service, audits } = serviceWith(async (text) => {
    if (text.startsWith("SELECT * FROM courses")) {
      return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "DRAFT" }] };
    }
    return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "PUBLISHED" }] };
  });

  const result = await service.changeStatus("course-1", "course", "PUBLISHED", request);

  assert.equal(result.status, "PUBLISHED");
  assert.equal(audits.length, 1);
  assert.equal(audits[0].action, "PUBLISH");
  assert.equal(audits[0].tenantId, user.tenantId);
});

test("managed file delivery is tenant-scoped and auditable", async () => {
  const audits: Array<Record<string, unknown>> = [];
  const queries: Array<{ text: string; values: unknown[] }> = [];
  const db = {
    query: async (text: string, values: unknown[]) => {
      queries.push({ text, values });
      if (text.startsWith("SELECT lr.*")) {
        return { rows: [{ id: "resource-1", tenant_id: user.tenantId, institution_id: "institution-1", resource_type: "PDF" }] };
      }
      return { rows: [{ id: "file-1", tenant_id: user.tenantId, resource_id: "resource-1", kind: "FILE", storage_key: "tenant-1/resource-1/file.pdf", original_filename: "file.pdf", mime_type: "application/pdf" }] };
    },
  };
  const storage = { read: async (storageKey: string) => Buffer.from(storageKey) };
  const audit = { record: async (input: Record<string, unknown>) => audits.push(input) };
  const service = new LmsService(db as never, audit as never, storage as never);

  const result = await service.getManagedFile("resource-1", request);

  assert.deepEqual(result.content, Buffer.from("tenant-1/resource-1/file.pdf"));
  assert.equal(queries[0].values[1], user.tenantId);
  assert.equal(queries[1].values[1], user.tenantId);
  assert.equal(audits.at(-1)?.action, "DOWNLOAD");
  assert.equal(audits.at(-1)?.tenantId, user.tenantId);
});

test("enrollment accepts an active institution Student and audits the mutation", async () => {
  const audits: Array<Record<string, unknown>> = [];
  const queries: string[] = [];
  const db = {
    query: async (text: string) => {
      queries.push(text);
      if (text.startsWith("SELECT c.id")) return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
      if (text.startsWith("SELECT 1")) return { rows: [{ allowed: 1 }] };
      if (text.startsWith("SELECT u.id")) return { rows: [{ id: "student-1", first_name: "Learner", last_name: "One" }] };
      if (text.startsWith("INSERT INTO lms_enrollments")) return { rows: [{ id: "enrollment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", learner_id: "student-1", status: "ACTIVE" }] };
      return { rows: [] };
    },
  };
  const audit = { record: async (input: Record<string, unknown>) => audits.push(input) };
  const service = new LmsService(db as never, audit as never, new ResourceStorageService());

  const result = await service.enrollLearner("course-1", { learnerId: "student-1" }, request);

  assert.equal(result.learner_id, "student-1");
  assert.equal(audits[0].resource, "enrollment");
  assert.equal(audits[0].action, "CREATE");
  assert.ok(queries.some((query) => query.includes("ur.institution_id = $3")));
});

test("enrollment rejects a user who is not an active Student in the course institution", async () => {
  let inserted = false;
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT c.id")) return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
    if (text.startsWith("SELECT 1")) return { rows: [{ allowed: 1 }] };
    if (text.startsWith("INSERT INTO lms_enrollments")) inserted = true;
    return { rows: [] };
  });

  await assert.rejects(
    service.enrollLearner("course-1", { learnerId: "teacher-1" }, request),
    NotFoundException,
  );
  assert.equal(inserted, false);
});

test("duplicate instructor assignment is returned as a conflict", async () => {
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT c.id")) return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
    if (text.startsWith("SELECT 1")) return { rows: [{ allowed: 1 }] };
    if (text.startsWith("SELECT u.id")) return { rows: [{ id: "teacher-1", first_name: "Teacher", last_name: "One" }] };
    if (text.startsWith("INSERT INTO lms_instructor_assignments")) throw Object.assign(new Error("duplicate"), { code: "23505" });
    return { rows: [] };
  });

  await assert.rejects(
    service.assignInstructor("course-1", { instructorId: "teacher-1" }, request),
    ConflictException,
  );
});

test("removing an enrollment preserves the row and audits the removal", async () => {
  const audits: Array<Record<string, unknown>> = [];
  const db = {
    query: async (text: string) => {
      if (text.startsWith("SELECT c.id")) return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
      if (text.startsWith("SELECT 1")) return { rows: [{ allowed: 1 }] };
      if (text.startsWith("SELECT * FROM lms_enrollments")) return { rows: [{ id: "enrollment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", status: "ACTIVE" }] };
      if (text.startsWith("UPDATE lms_enrollments")) return { rows: [{ id: "enrollment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", status: "REMOVED" }] };
      return { rows: [] };
    },
  };
  const audit = { record: async (input: Record<string, unknown>) => audits.push(input) };
  const service = new LmsService(db as never, audit as never, new ResourceStorageService());

  const result = await service.removeEnrollment("course-1", "enrollment-1", request);

  assert.equal(result.status, "REMOVED");
  assert.equal(audits[0].action, "REMOVE");
  assert.equal(audits[0].institutionId, "institution-1");
});

test("course progress derives lesson and assessment totals by module", async () => {
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT c.id")) {
      return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", title: "Digital Skills", code: "DS-101", description: "Foundations", status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
    }
    if (text.startsWith("SELECT 1")) return { rows: [{ allowed: 1 }] };
    if (text.startsWith("SELECT cm.id")) {
      return {
        rows: [
          { module_id: "module-1", module_title: "Foundations", sequence: 1, lesson_total: 2, lesson_completed: 1, assessment_total: 1, assessment_completed: 1 },
          { module_id: "module-2", module_title: "Practice", sequence: 2, lesson_total: 1, lesson_completed: 0, assessment_total: 0, assessment_completed: 0 },
        ],
      };
    }
    return { rows: [] };
  });

  const result = await service.getCourseProgress("course-1", user);

  assert.equal(result.state, "IN_PROGRESS");
  assert.equal(result.percentage, 50);
  assert.deepEqual(result.lessons, { completed: 1, total: 3 });
  assert.deepEqual(result.assessments, { completed: 1, total: 1 });
  assert.equal(result.modules[0].percentage, 66.67);
  assert.equal(result.modules[1].state, "NOT_STARTED");
});

test("course progress rejects institution staff outside their authorized scope", async () => {
  const staff: AuthenticatedUser = {
    ...user,
    id: "teacher-1",
    roles: [{ code: "TEACHER", name: "Teacher" }],
  };
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT c.id")) {
      return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", title: "Digital Skills", code: "DS-101", status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
    }
    if (text.includes("FROM lms_enrollments")) return { rows: [{ allowed: 1 }] };
    if (text.includes("FROM user_roles")) return { rows: [] };
    return { rows: [] };
  });

  await assert.rejects(service.getCourseProgress("course-1", staff, "student-1"), ForbiddenException);
});

test("lesson completion requires an active enrollment and audits only the first transition", async () => {
  const { service, audits } = serviceWith(async (text) => {
    if (text.startsWith("SELECT l.id")) {
      return { rows: [{ id: "lesson-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", lesson_status: "PUBLISHED", module_status: "PUBLISHED", course_status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
    }
    if (text.startsWith("SELECT id, tenant_id")) return { rows: [{ id: "enrollment-1" }] };
    if (text.startsWith("SELECT * FROM lms_lesson_progress")) return { rows: [] };
    if (text.startsWith("INSERT INTO lms_lesson_progress")) return { rows: [{ id: "progress-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", lesson_id: "lesson-1", learner_id: user.id, status: "COMPLETED" }] };
    return { rows: [] };
  });

  const result = await service.completeLesson("lesson-1", request);

  assert.equal(result.status, "COMPLETED");
  assert.equal(audits[0].resource, "lesson_progress");
  assert.equal(audits[0].action, "COMPLETE");
});

test("lesson completion rejects learners without an active course enrollment", async () => {
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT l.id")) {
      return { rows: [{ id: "lesson-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", lesson_status: "PUBLISHED", module_status: "PUBLISHED", course_status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
    }
    if (text.startsWith("SELECT id, tenant_id")) return { rows: [] };
    return { rows: [] };
  });

  await assert.rejects(service.completeLesson("lesson-1", request), ForbiddenException);
});

test("assessment completion records a result and derives pass status", async () => {
  const { service, audits } = serviceWith(async (text) => {
    if (text.startsWith("SELECT a.*")) {
      return { rows: [{ id: "assessment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", status: "PUBLISHED", module_status: "PUBLISHED", course_status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE", total_marks: "100", passing_marks: "60", attempt_limit: null }] };
    }
    if (text.startsWith("SELECT id, tenant_id")) return { rows: [{ id: "enrollment-1" }] };
    if (text.startsWith("SELECT * FROM lms_assessment_completions")) return { rows: [] };
    if (text.startsWith("INSERT INTO lms_assessment_completions")) return { rows: [{ id: "completion-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-1", learner_id: user.id, attempt_id: "attempt-1", score: 82, passed: true, status: "COMPLETED" }] };
    return { rows: [] };
  });

  const result = await service.completeAssessment({ assessmentId: "assessment-1", attemptId: "attempt-1", score: 82 }, request);

  assert.equal(result.passed, true);
  assert.equal(audits[0].resource, "assessment_completion");
  assert.equal(audits[0].action, "COMPLETE");
});

test("assignment creation is scoped to an assigned course module and audited", async () => {
  const { service, audits } = serviceWith(async (text) => {
    if (text.startsWith("SELECT c.id")) return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
    if (text.includes("FROM user_roles")) return { rows: [{ allowed: 1 }] };
    if (text.startsWith("SELECT cm.id")) return { rows: [{ id: "module-1", course_id: "course-1", status: "PUBLISHED" }] };
    if (text.startsWith("INSERT INTO lms_assessments")) return { rows: [{ id: "assignment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", title: "Portfolio", assessment_type: "ASSIGNMENT", status: "DRAFT", max_marks: 100 }] };
    return { rows: [] };
  });

  const result = await service.createAssignment({
    courseId: "course-1",
    moduleId: "module-1",
    title: "Portfolio",
    instructions: "Submit your portfolio.",
    maxMarks: 100,
  }, request);

  assert.equal(result.assessment_type, "ASSIGNMENT");
  assert.equal(audits[0].resource, "assignment");
  assert.equal(audits[0].action, "CREATE");
});

test("a learner submission is graded by scoped staff and completes assignment progress", async () => {
  const learner: AuthenticatedUser = {
    ...user,
    id: "student-1",
    roles: [{ code: "STUDENT", name: "Student" }],
  };
  const learnerRequest = { context: { ...request.context, user: learner } } as unknown as ContextRequest;
  const assignment = { id: "assignment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", title: "Portfolio", assessment_type: "ASSIGNMENT", status: "PUBLISHED", course_status: "PUBLISHED", module_status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE", total_marks: "100", due_at: null };
  let submission: Record<string, unknown> | undefined;
  const { service, audits } = serviceWith(async (text) => {
    if (text.startsWith("SELECT a.*")) return { rows: [assignment] };
    if (text.startsWith("SELECT id, tenant_id")) return { rows: [{ id: "enrollment-1" }] };
    if (text.startsWith("SELECT * FROM lms_assignment_submissions")) return { rows: submission ? [submission] : [] };
    if (text.startsWith("INSERT INTO lms_assignment_submissions")) {
      submission = { id: "submission-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", assignment_id: "assignment-1", learner_id: "student-1", status: "SUBMITTED", submission_text: "My work" };
      return { rows: [submission] };
    }
    if (text.includes("FROM user_roles")) return { rows: [{ allowed: 1 }] };
    if (text.startsWith("UPDATE lms_assignment_submissions")) {
      submission = { ...submission, status: "GRADED", grade: 86, graded_by: user.id, graded_at: new Date().toISOString() };
      return { rows: [submission] };
    }
    if (text.startsWith("INSERT INTO lms_assessment_completions")) return { rows: [{ id: "completion-1", assessment_id: "assignment-1", learner_id: "student-1", score: 86 }] };
    return { rows: [] };
  });

  const submitted = await service.submitAssignment("assignment-1", { submissionText: "My work" }, learnerRequest);
  assert.equal(submitted.status, "SUBMITTED");
  const graded = await service.gradeAssignmentSubmission("assignment-1", "submission-1", { grade: 86, feedback: "Strong work." }, request);

  assert.equal(graded.status, "GRADED");
  assert.equal(audits.some((audit) => audit.resource === "assignment_submission" && audit.action === "SUBMIT"), true);
  assert.equal(audits.some((audit) => audit.resource === "assignment_submission" && audit.action === "GRADE"), true);
  assert.equal(audits.some((audit) => audit.resource === "assessment_completion"), true);
});

test("assignment grades cannot exceed the configured maximum", async () => {
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT a.*")) return { rows: [{ id: "assignment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", assessment_type: "ASSIGNMENT", status: "PUBLISHED", course_status: "PUBLISHED", module_status: "PUBLISHED", total_marks: "50" }] };
    if (text.includes("FROM user_roles")) return { rows: [{ allowed: 1 }] };
    return { rows: [] };
  });

  await assert.rejects(
    service.gradeAssignmentSubmission("assignment-1", "submission-1", { grade: 51 }, request),
    BadRequestException,
  );
});