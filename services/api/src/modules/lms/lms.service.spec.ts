import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { LmsService, courseCodeFromSeed } from "./lms.service";
import { LmsContentRateLimiter } from "./lms.rate-limit";
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

const builderProgrammeId = "11111111-1111-4111-8111-111111111111";
const builderParent = { id: builderProgrammeId, institution_id: "institution-1", campus_id: null };
const builderRequest = request;

function builderPayload(overrides: Record<string, unknown> = {}): {
  course: Record<string, unknown>;
  modules: Array<{
    title: string;
    lessons: Array<{ title: string; resources: Array<Record<string, unknown>> }>;
    assignments: Array<Record<string, unknown>>;
    assessments: Array<Record<string, unknown>>;
  }>;
} {
  return {
    course: {
      programmeId: builderProgrammeId,
      title: "Atomic course",
      codeSeed: "22222222-2222-4222-8222-222222222222",
      ...overrides,
    },
    modules: [{
      title: "Module one",
      lessons: [{
        title: "Lesson one",
        resources: [],
      }],
      assignments: [],
      assessments: [],
    }],
  };
}

test("course builder generates a stable server-owned code and ignores a supplied code", async () => {
  const seed = "33333333-3333-4333-8333-333333333333";
  const insertedValues: unknown[] = [];
  const { db } = builderDb(async (text, values) => {
    if (text.includes("FOR SHARE")) return { rows: [builderParent] };
    if (text.startsWith("SELECT 1 FROM courses WHERE tenant_id")) {
      assert.deepEqual(values, [user.tenantId, courseCodeFromSeed(seed)]);
      return { rows: [] };
    }
    if (text.includes("INSERT INTO courses")) {
      insertedValues.push(...values);
      return { rows: [{ id: "course-1", code: values[5], tenant_id: user.tenantId }] };
    }
    if (text.includes("INSERT INTO course_modules")) return { rows: [{ id: "module-1", tenant_id: user.tenantId }] };
    if (text.includes("INSERT INTO lessons")) return { rows: [{ id: "lesson-1", tenant_id: user.tenantId }] };
    return { rows: [] };
  });
  const service = new LmsService(db as never, { record: async () => undefined } as never, new ResourceStorageService());

  await service.createCourseBuilder(builderPayload({
    code: "MANUAL-101",
    codeSeed: seed,
  }), [], builderRequest);

  assert.equal(insertedValues[5], courseCodeFromSeed(seed));
  assert.notEqual(insertedValues[5], "MANUAL-101");
});

test("course builder retries a generated code when the candidate is already used", async () => {
  const seed = "44444444-4444-4444-8444-444444444444";
  let candidateChecks = 0;
  let insertedCode: unknown;
  const { db } = builderDb(async (text, values) => {
    if (text.includes("FOR SHARE")) return { rows: [builderParent] };
    if (text.startsWith("SELECT 1 FROM courses WHERE tenant_id")) {
      candidateChecks += 1;
      if (candidateChecks === 1) {
        assert.deepEqual(values, [user.tenantId, courseCodeFromSeed(seed)]);
        return { rows: [{ id: "existing-course" }] };
      }
      return { rows: [] };
    }
    if (text.includes("INSERT INTO courses")) {
      insertedCode = values[5];
      return { rows: [{ id: "course-2", code: insertedCode, tenant_id: user.tenantId }] };
    }
    if (text.includes("INSERT INTO course_modules")) return { rows: [{ id: "module-2", tenant_id: user.tenantId }] };
    if (text.includes("INSERT INTO lessons")) return { rows: [{ id: "lesson-2", tenant_id: user.tenantId }] };
    return { rows: [] };
  });
  const service = new LmsService(db as never, { record: async () => undefined } as never, new ResourceStorageService());

  await service.createCourseBuilder(builderPayload({ codeSeed: seed }), [], builderRequest);

  assert.equal(candidateChecks, 2);
  assert.match(String(insertedCode), /^CRS-[0-9A-F]{32}$/);
  assert.notEqual(insertedCode, courseCodeFromSeed(seed));
});

function builderDb(
  clientQuery: (text: string, values: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>,
) {
  let rolledBack = false;
  const db = {
    query: async (text: string, values: unknown[]) => {
      if (text.startsWith("SELECT id, institution_id, campus_id FROM programmes")) return { rows: [builderParent] };
      return { rows: [] };
    },
    transaction: async <T>(work: (client: { query: typeof clientQuery }) => Promise<T>) => {
      try {
        return await work({ query: clientQuery });
      } catch (error) {
        rolledBack = true;
        throw error;
      }
    },
  };
  return { db, wasRolledBack: () => rolledBack };
}

test("course builder validates the full structure before opening a transaction", async () => {
  let transactionStarted = false;
  const db = {
    query: async () => ({ rows: [builderParent] }),
    transaction: async () => {
      transactionStarted = true;
      throw new Error("transaction should not start");
    },
  };
  const service = new LmsService(db as never, { record: async () => undefined } as never, new ResourceStorageService());

  await assert.rejects(
    service.createCourseBuilder({
      course: builderPayload().course,
      modules: [{ title: "Missing children" }],
    }, [], builderRequest),
    BadRequestException,
  );
  assert.equal(transactionStarted, false);
});

test("course builder rolls back database records when module creation fails", async () => {
  let courseInserted = false;
  const { db, wasRolledBack } = builderDb(async (text) => {
    if (text.includes("FOR SHARE")) return { rows: [builderParent] };
    if (text.startsWith("INSERT INTO courses")) {
      courseInserted = true;
      return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", campus_id: null }] };
    }
    if (text.startsWith("INSERT INTO course_modules")) throw new Error("module insert failed");
    return { rows: [] };
  });
  const service = new LmsService(db as never, { record: async () => undefined } as never, new ResourceStorageService());

  await assert.rejects(service.createCourseBuilder(builderPayload(), [], builderRequest), /module insert failed/);
  assert.equal(courseInserted, true);
  assert.equal(wasRolledBack(), true);
});

test("course builder removes a staged document when a later database step fails", async () => {
  const removed: string[] = [];
  let stored: { storageKey: string; originalFilename: string; mimeType: string; byteSize: number; sha256: string } | undefined;
  const storage = {
    storeDocument: async () => {
      stored = { storageKey: "tenant-1/resource-1", originalFilename: "lesson.pdf", mimeType: "application/pdf", byteSize: 4, sha256: "a".repeat(64) };
      return stored;
    },
    storeScormPackage: async () => { throw new Error("unexpected SCORM upload"); },
    remove: async (key: string) => { removed.push(key); },
  };
  const payload = builderPayload();
  (payload.modules[0].lessons[0].resources as unknown[]).push({
    title: "Handout",
    resourceType: "PDF",
    fileField: "resource-file-1",
  });
  const { db, wasRolledBack } = builderDb(async (text) => {
    if (text.includes("FOR SHARE")) return { rows: [builderParent] };
    if (text.startsWith("INSERT INTO courses")) return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", campus_id: null }] };
    if (text.startsWith("INSERT INTO course_modules")) return { rows: [{ id: "module-1", tenant_id: user.tenantId, institution_id: "institution-1", campus_id: null }] };
    if (text.startsWith("INSERT INTO lessons")) return { rows: [{ id: "lesson-1", tenant_id: user.tenantId, institution_id: "institution-1", campus_id: null }] };
    if (text.startsWith("INSERT INTO learning_resources")) return { rows: [{ id: "resource-1", tenant_id: user.tenantId, institution_id: "institution-1", campus_id: null }] };
    if (text.startsWith("INSERT INTO managed_files")) throw new Error("managed file insert failed");
    return { rows: [] };
  });
  const service = new LmsService(db as never, { record: async () => undefined } as never, storage as never);

  await assert.rejects(
    service.createCourseBuilder(payload, [{
      fieldname: "resource-file-1",
      originalname: "lesson.pdf",
      mimetype: "application/pdf",
      size: 4,
      buffer: Buffer.from("pdf"),
    }], builderRequest),
    /managed file insert failed/,
  );
  assert.equal(wasRolledBack(), true);
  assert.deepEqual(removed, ["tenant-1/resource-1"]);
  assert.ok(stored);
});

test("course builder commits a complete course and uploaded document", async () => {
  let managedFileInserted = false;
  const storage = {
    storeDocument: async () => ({
      storageKey: "tenant-1/resource-1",
      originalFilename: "lesson.pdf",
      mimeType: "application/pdf",
      byteSize: 4,
      sha256: "a".repeat(64),
    }),
    storeScormPackage: async () => { throw new Error("unexpected SCORM upload"); },
    remove: async () => undefined,
  };
  const payload = builderPayload();
  payload.modules[0].lessons[0].resources.push({ title: "Handout", resourceType: "PDF", fileField: "resource-file-1" });
  const { db, wasRolledBack } = builderDb(async (text) => {
    if (text.includes("FOR SHARE")) return { rows: [builderParent] };
    if (text.startsWith("INSERT INTO courses")) return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", campus_id: null }] };
    if (text.startsWith("INSERT INTO course_modules")) return { rows: [{ id: "module-1" }] };
    if (text.startsWith("INSERT INTO lessons")) return { rows: [{ id: "lesson-1" }] };
    if (text.startsWith("INSERT INTO learning_resources")) return { rows: [{ id: "resource-1" }] };
    if (text.startsWith("INSERT INTO managed_files")) {
      managedFileInserted = true;
      return { rows: [{ id: "managed-1" }] };
    }
    return { rows: [] };
  });
  const service = new LmsService(db as never, { record: async () => undefined } as never, storage as never);

  const created = await service.createCourseBuilder(payload, [{
    fieldname: "resource-file-1",
    originalname: "lesson.pdf",
    mimetype: "application/pdf",
    size: 4,
    buffer: Buffer.from("pdf"),
  }], builderRequest);
  assert.equal(created.id, "course-1");
  assert.equal(managedFileInserted, true);
  assert.equal(wasRolledBack(), false);
});

test("course builder cleans a SCORM package when question creation fails", async () => {
  const removed: string[] = [];
  const storage = {
    storeDocument: async () => { throw new Error("unexpected document upload"); },
    storeScormPackage: async () => ({
      storageKey: "tenant-1/scorm-1",
      originalFilename: "course.zip",
      mimeType: "application/zip",
      byteSize: 4,
      sha256: "b".repeat(64),
      entrypoint: "index.html",
    }),
    remove: async (key: string) => { removed.push(key); },
  };
  const payload = builderPayload();
  payload.modules[0].lessons[0].resources.push({ title: "Package", resourceType: "SCORM", fileField: "scorm-file-1" });
  payload.modules[0].assessments.push({
    title: "Quiz",
    assessmentType: "PRACTICE_QUIZ",
    questions: [{
      prompt: "Question?",
      questionType: "SINGLE_CHOICE",
      marks: 1,
      options: [{ value: "a", label: "A", isCorrect: true }, { value: "b", label: "B", isCorrect: false }],
    }],
  });
  const { db, wasRolledBack } = builderDb(async (text) => {
    if (text.includes("FOR SHARE")) return { rows: [builderParent] };
    if (text.startsWith("INSERT INTO courses")) return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", campus_id: null }] };
    if (text.startsWith("INSERT INTO course_modules")) return { rows: [{ id: "module-1" }] };
    if (text.startsWith("INSERT INTO lessons")) return { rows: [{ id: "lesson-1" }] };
    if (text.startsWith("INSERT INTO learning_resources")) return { rows: [{ id: "scorm-1" }] };
    if (text.startsWith("INSERT INTO managed_files")) return { rows: [{ id: "managed-1" }] };
    if (text.startsWith("INSERT INTO lms_assessments")) return { rows: [{ id: "assessment-1" }] };
    if (text.startsWith("INSERT INTO lms_assessment_questions")) throw new Error("question insert failed");
    return { rows: [] };
  });
  const service = new LmsService(db as never, { record: async () => undefined } as never, storage as never);

  await assert.rejects(
    service.createCourseBuilder(payload, [{
      fieldname: "scorm-file-1",
      originalname: "course.zip",
      mimetype: "application/zip",
      size: 4,
      buffer: Buffer.from("zip"),
    }], builderRequest),
    /question insert failed/,
  );
  assert.equal(wasRolledBack(), true);
  assert.deepEqual(removed, ["tenant-1/scorm-1"]);
});

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

test("learning resources reject non-HTTP URL schemes", async () => {
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT id FROM lessons")) return { rows: [{ id: "lesson-1" }] };
    return { rows: [] };
  });

  await assert.rejects(
    service.createLearningResource({
      lessonId: "lesson-1",
      resourceType: "VIDEO",
      title: "Unsafe video",
      url: "javascript:alert(1)",
      sequence: 1,
    }, request),
    BadRequestException,
  );
});

test("assigned teachers can read nested course content while unassigned teachers receive not found", async () => {
  const teacher: AuthenticatedUser = {
    ...user,
    email: "teacher@example.com",
    roles: [{ code: "TEACHER", name: "Teacher" }],
    permissions: ["lms.course_module.view"],
  };
  const teacherRequest = { context: { ...request.context, user: teacher } } as unknown as ContextRequest;
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT p.institution_id")) return { rows: [{ id: "module-1", institution_id: "institution-1", campus_id: null, course_id: "course-1" }] };
    if (text.startsWith("SELECT 1")) return { rows: [{ allowed: 1 }] };
    if (text.startsWith("SELECT * FROM course_modules")) return { rows: [{ id: "module-1", tenant_id: teacher.tenantId, course_id: "course-1", title: "Module one" }] };
    return { rows: [] };
  });

  const visible = await service.getChild("module-1", "course_modules", teacher);
  assert.equal((visible as Record<string, unknown>).id, "module-1");

  const { service: blockedService } = serviceWith(async (text) => {
    if (text.startsWith("SELECT p.institution_id")) return { rows: [{ institution_id: "institution-1", campus_id: null, course_id: "course-2" }] };
    if (text.startsWith("SELECT 1")) return { rows: [] };
    return { rows: [] };
  });
  await assert.rejects(blockedService.getChild("module-2", "course_modules", teacher), NotFoundException);
});

test("enrolled learners can list and read content only through their active course enrollment", async () => {
  const learner: AuthenticatedUser = {
    ...user,
    id: "learner-1",
    email: "learner@example.com",
    roles: [{ code: "STUDENT", name: "Student" }],
    permissions: ["lms.course_module.view", "lms.lesson.view", "lms.learning_resource.view"],
  };
  const queries: Array<{ text: string; values: unknown[] }> = [];
  const { service } = serviceWith(async (text, values) => {
    queries.push({ text, values });
    if (text.startsWith("SELECT p.institution_id")) {
      return { rows: [{ institution_id: "institution-1", campus_id: null, course_id: "course-1" }] };
    }
    if (text.includes("FROM lms_enrollments")) return { rows: [{ enrolled: 1 }] };
    if (text.startsWith("SELECT * FROM lessons")) {
      return { rows: [{ id: "lesson-1", tenant_id: learner.tenantId, module_id: "module-1", title: "Lesson one" }] };
    }
    if (text.startsWith("SELECT count")) return { rows: [{ count: "0" }] };
    return { rows: [] };
  });

  const visible = await service.getChild("lesson-1", "lessons", learner);
  assert.equal((visible as Record<string, unknown>).id, "lesson-1");
  await service.listCourseModules(learner, 1, 20, 0, {}, "course-1");
  await service.listLessons(learner, 1, 20, 0, {}, "module-1");
  await service.listResources(learner, 1, 20, 0, {}, "lesson-1");

  const listQueries = queries.filter(({ text }) => text.includes("ORDER BY x.sequence"));
  assert.equal(listQueries.length, 3);
  assert.ok(listQueries.every(({ text }) => text.includes("lms_enrollments")));
  assert.ok(listQueries.every(({ values }) => values.includes(learner.id)));
});

test("unenrolled learners cannot read nested content, managed files, or SCORM resources", async () => {
  const learner: AuthenticatedUser = {
    ...user,
    id: "learner-2",
    email: "unenrolled@example.com",
    roles: [{ code: "STUDENT", name: "Student" }],
    permissions: ["lms.course_module.view", "lms.lesson.view", "lms.learning_resource.view"],
  };
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT p.institution_id") || text.startsWith("SELECT lr.*")) {
      return {
        rows: [{
          institution_id: "institution-1",
          campus_id: null,
          course_id: "course-2",
          id: "resource-2",
          tenant_id: learner.tenantId,
          resource_type: "SCORM",
        }],
      };
    }
    if (text.includes("FROM lms_enrollments")) return { rows: [] };
    throw new Error(`Unexpected query after denied content access: ${text}`);
  });
  const learnerRequest = { context: { ...request.context, user: learner } } as unknown as ContextRequest;

  await assert.rejects(service.getChild("module-2", "course_modules", learner), NotFoundException);
  await assert.rejects(service.getChild("lesson-2", "lessons", learner), NotFoundException);
  await assert.rejects(service.getChild("resource-2", "learning_resources", learner), NotFoundException);
  await assert.rejects(service.getManagedFile("resource-2", learnerRequest), NotFoundException);
  await assert.rejects(service.getScormLaunch("resource-2", learnerRequest), NotFoundException);
  await assert.rejects(service.getScormAsset("resource-2", "index.html", learnerRequest), NotFoundException);
});

test("hierarchy list filters bind each child to its requested parent", async () => {
  const queries: string[] = [];
  const { service } = serviceWith(async (text) => {
    queries.push(text);
    if (text.startsWith("SELECT count")) return { rows: [{ count: "0" }] };
    return { rows: [] };
  });

  await service.listLessons(user, 1, 20, 0, {}, "module-1");
  await service.listResources(user, 1, 20, 0, {}, "lesson-1");

  const lessonListQuery = queries.find((text) => text.includes("FROM lessons x"));
  const resourceListQuery = queries.find((text) => text.includes("FROM learning_resources x"));
  assert.ok(lessonListQuery?.includes("x.module_id = $"));
  assert.ok(lessonListQuery?.includes("JOIN course_modules cm ON cm.id = x.module_id"));
  assert.ok(resourceListQuery?.includes("x.lesson_id = $"));
  assert.ok(resourceListQuery?.includes("JOIN lessons l ON l.id = x.lesson_id"));
});

test("only assigned teachers can create nested course content", async () => {
  const teacher: AuthenticatedUser = {
    ...user,
    email: "teacher@example.com",
    roles: [{ code: "TEACHER", name: "Teacher" }],
    permissions: ["lms.course_module.create"],
  };
  const teacherRequest = { context: { ...request.context, user: teacher } } as unknown as ContextRequest;
  let inserted = false;
  const { service } = serviceWith(async (text) => {
    if (text.includes("FROM courses c")) return { rows: [{ institution_id: "institution-1", campus_id: null, course_id: "course-1" }] };
    if (text.startsWith("SELECT id FROM courses")) return { rows: [{ id: "course-1" }] };
    if (text.startsWith("SELECT institution_id, campus_id FROM courses")) return { rows: [{ institution_id: "institution-1", campus_id: null }] };
    if (text.startsWith("SELECT 1")) return { rows: [{ allowed: 1 }] };
    if (text.startsWith("INSERT INTO course_modules")) {
      inserted = true;
      return { rows: [{ id: "module-1", tenant_id: teacher.tenantId, course_id: "course-1", title: "Module one", status: "DRAFT" }] };
    }
    return { rows: [] };
  });

  const created = await service.createCourseModule({ courseId: "course-1", title: "Module one", sequence: 1 }, teacherRequest);
  assert.equal(created.id, "module-1");
  assert.equal(inserted, true);

  const { service: blockedService } = serviceWith(async (text) => {
    if (text.includes("FROM courses c")) return { rows: [{ institution_id: "institution-1", campus_id: null, course_id: "course-1" }] };
    if (text.startsWith("SELECT id FROM courses")) return { rows: [{ id: "course-1" }] };
    if (text.startsWith("SELECT institution_id, campus_id FROM courses")) return { rows: [{ institution_id: "institution-1", campus_id: null }] };
    if (text.startsWith("SELECT 1")) return { rows: [] };
    return { rows: [] };
  });
  await assert.rejects(blockedService.createCourseModule({ courseId: "course-1", title: "Blocked module", sequence: 1 }, teacherRequest), ForbiddenException);
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
    if (text.includes("FROM learning_resources lr")) {
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

test("resource progress is clamped, persisted, and rate limited", async () => {
  const learner: AuthenticatedUser = {
    ...user,
    id: "learner-progress",
    roles: [{ code: "STUDENT", name: "Student" }],
  };
  const queries: Array<{ text: string; values: unknown[] }> = [];
  const db = {
    query: async (text: string, values: unknown[]) => {
      queries.push({ text, values });
      if (text.startsWith("SELECT lr.*")) {
        return {
          rows: [{
            id: "resource-1",
            tenant_id: user.tenantId,
            institution_id: "institution-1",
            campus_id: null,
            course_id: "course-1",
            module_id: "module-1",
            lesson_id: "lesson-1",
            resource_type: "VIDEO",
            resource_status: "PUBLISHED",
            lesson_status: "PUBLISHED",
            module_status: "PUBLISHED",
            course_status: "PUBLISHED",
            programme_status: "PUBLISHED",
            institution_status: "ACTIVE",
          }],
        };
      }
      return { rows: [{ resource_id: "resource-1", progress_percent: 100, completed: true, position_seconds: 120, duration_seconds: 120 }] };
    },
  };
  const service = new LmsService(
    db as never,
    { record: async () => undefined } as never,
    new ResourceStorageService(),
    undefined,
    new LmsContentRateLimiter(),
  );

  const result = await service.updateResourceProgress("resource-1", {
    positionSeconds: 240,
    durationSeconds: 120,
    completed: false,
  }, { context: { ...request.context, user: learner } } as unknown as ContextRequest);

  assert.equal(result.completed, true);
  assert.equal(queries.at(-1)?.values[8], 120);
  assert.equal(queries.at(-1)?.values[10], 100);
});

test("resource progress ignores a forged completion flag until server progress reaches the end", async () => {
  const learner: AuthenticatedUser = {
    ...user,
    id: "learner-forged-progress",
    roles: [{ code: "STUDENT", name: "Student" }],
  };
  const queries: Array<{ text: string; values: unknown[] }> = [];
  const db = {
    query: async (text: string, values: unknown[]) => {
      queries.push({ text, values });
      if (text.startsWith("SELECT lr.*")) {
        return {
          rows: [{
            id: "resource-1",
            tenant_id: user.tenantId,
            institution_id: "institution-1",
            campus_id: null,
            course_id: "course-1",
            module_id: "module-1",
            lesson_id: "lesson-1",
            resource_type: "VIDEO",
            resource_status: "PUBLISHED",
            lesson_status: "PUBLISHED",
            module_status: "PUBLISHED",
            course_status: "PUBLISHED",
            programme_status: "PUBLISHED",
            institution_status: "ACTIVE",
          }],
        };
      }
      return { rows: [{ resource_id: "resource-1", progress_percent: 0, completed: false, position_seconds: 1, duration_seconds: 120 }] };
    },
  };
  const service = new LmsService(
    db as never,
    { record: async () => undefined } as never,
    new ResourceStorageService(),
    undefined,
    new LmsContentRateLimiter(),
  );

  const result = await service.updateResourceProgress("resource-1", {
    positionSeconds: 1,
    durationSeconds: 120,
    completed: true,
  }, { context: { ...request.context, user: learner } } as unknown as ContextRequest);

  assert.equal(result.completed, false);
  assert.equal(queries.at(-1)?.values[10], 0.83);
  assert.equal(queries.at(-1)?.values[11], false);
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

test("teacher course listing is limited to active instructor assignments", async () => {
  const teacher: AuthenticatedUser = {
    ...user,
    id: "teacher-1",
    roles: [{ code: "TEACHER", name: "Teacher" }],
  };
  const queries: string[] = [];
  const { service } = serviceWith(async (text) => {
    queries.push(text);
    if (text.startsWith("SELECT c.id")) {
      return { rows: [{ id: "assigned-course", tenant_id: teacher.tenantId, institution_id: "institution-1", title: "Assigned course", code: "AC-101", status: "PUBLISHED" }] };
    }
    return { rows: [{ count: "1" }] };
  });

  const result = await service.listCourses(teacher, 1, 100, 0, {});

  assert.equal(result.data.length, 1);
  assert.ok(queries.some((query) => query.includes("lms_instructor_assignments")));
  assert.ok(queries.some((query) => query.includes("ia.instructor_id")));
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

test("direct learners can complete institutionless enrollments without an institution scope", async () => {
  const directLearner: AuthenticatedUser = {
    ...user,
    id: "direct-student-1",
    studentType: "DIRECT_STUDENT",
    roles: [{ code: "STUDENT", name: "Student" }],
    scopes: [],
  };
  const directRequest = { context: { ...request.context, user: directLearner } } as unknown as ContextRequest;
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT l.id")) {
      return {
        rows: [{
          id: "lesson-1",
          tenant_id: directLearner.tenantId,
          institution_id: "institution-1",
          course_id: "course-1",
          module_id: "module-1",
          lesson_status: "PUBLISHED",
          module_status: "PUBLISHED",
          course_status: "PUBLISHED",
          programme_status: "PUBLISHED",
          institution_status: "ACTIVE",
        }],
      };
    }
    if (text.startsWith("SELECT id, tenant_id")) return { rows: [{ id: "direct-enrollment-1" }] };
    if (text.startsWith("SELECT * FROM lms_lesson_progress")) return { rows: [] };
    if (text.startsWith("INSERT INTO lms_lesson_progress")) return { rows: [{ id: "progress-1", status: "COMPLETED" }] };
    return { rows: [] };
  });

  const result = await service.completeLesson("lesson-1", directRequest);

  assert.equal(result.status, "COMPLETED");
});

test("failed assignments do not count toward course completion", async () => {
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT c.id")) {
      return {
        rows: [{
          id: "course-1",
          tenant_id: user.tenantId,
          institution_id: "institution-1",
          title: "Digital Skills",
          code: "DS-101",
          status: "PUBLISHED",
          programme_status: "PUBLISHED",
          institution_status: "ACTIVE",
        }],
      };
    }
    if (text.startsWith("SELECT 1")) return { rows: [{ allowed: 1 }] };
    if (text.startsWith("SELECT cm.id")) {
      return {
        rows: [{
          module_id: "module-1",
          module_title: "Foundations",
          sequence: 1,
          lesson_total: 0,
          lesson_completed: 0,
          assessment_total: 0,
          assessment_completed: 0,
          assignment_total: 1,
          assignment_completed: 0,
        }],
      };
    }
    return { rows: [] };
  });

  const result = await service.getCourseProgress("course-1", user);

  assert.equal(result.state, "NOT_STARTED");
  assert.equal(result.percentage, 0);
  assert.deepEqual(result.assignments, { completed: 0, total: 1 });
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

test("a learner submission is graded by a CITIS administrator and completes assignment progress", async () => {
  const learner: AuthenticatedUser = {
    ...user,
    id: "student-1",
    roles: [{ code: "STUDENT", name: "Student" }],
  };
  const learnerRequest = { context: { ...request.context, user: learner } } as unknown as ContextRequest;
  const assignment = { id: "assignment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", title: "Portfolio", assessment_type: "ASSIGNMENT", status: "PUBLISHED", course_status: "PUBLISHED", module_status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE", total_marks: "100", due_at: null };
  let submission: Record<string, unknown> | undefined;
  const reviewer: AuthenticatedUser = {
    ...user,
    roles: [{ code: "CITIS_ADMIN", name: "CITIS Admin" }],
  };
  const reviewerRequest = { context: { ...request.context, user: reviewer } } as unknown as ContextRequest;
  const { service, audits } = serviceWith(async (text) => {
    if (text.startsWith("SELECT a.*")) return { rows: [assignment] };
    if (text.startsWith("SELECT e.id, e.tenant_id")) return { rows: [{ id: "enrollment-1" }] };
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
  const graded = await service.gradeAssignmentSubmission("assignment-1", "submission-1", { grade: 86, feedback: "Strong work." }, reviewerRequest);

  assert.equal(graded.status, "GRADED");
  assert.equal(audits.some((audit) => audit.resource === "assignment_submission" && audit.action === "SUBMIT"), true);
  assert.equal(audits.some((audit) => audit.resource === "assignment_submission" && audit.action === "GRADE"), true);
  assert.equal(audits.some((audit) => audit.resource === "assessment_completion"), true);
});

test("instructors cannot review or grade assignment submissions", async () => {
  const instructor: AuthenticatedUser = {
    ...user,
    id: "instructor-1",
    roles: [{ code: "INSTRUCTOR", name: "Instructor" }],
  };
  const instructorRequest = { context: { ...request.context, user: instructor } } as unknown as ContextRequest;
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT a.*")) {
      return {
        rows: [{
          id: "assignment-1",
          tenant_id: instructor.tenantId,
          institution_id: "institution-1",
          course_id: "course-1",
          assessment_type: "ASSIGNMENT",
          total_marks: "100",
        }],
      };
    }
    return { rows: [] };
  });

  await assert.rejects(
    service.gradeAssignmentSubmission("assignment-1", "submission-1", { grade: 50 }, instructorRequest),
    ForbiddenException,
  );
});

test("assignment grades use a 50 percent pass threshold", async () => {
  const reviewer: AuthenticatedUser = {
    ...user,
    roles: [{ code: "CITIS_ADMIN", name: "CITIS Admin" }],
  };
  const reviewerRequest = { context: { ...request.context, user: reviewer } } as unknown as ContextRequest;
  let completionValues: unknown[] | undefined;
  const { service } = serviceWith(async (text, values) => {
    if (text.startsWith("SELECT a.*")) {
      return {
        rows: [{
          id: "assignment-1",
          tenant_id: reviewer.tenantId,
          institution_id: "institution-1",
          course_id: "course-1",
          module_id: "module-1",
          assessment_type: "ASSIGNMENT",
          total_marks: "100",
          campus_id: null,
        }],
      };
    }
    if (text.startsWith("SELECT * FROM lms_assignment_submissions")) {
      return {
        rows: [{
          id: "submission-1",
          tenant_id: reviewer.tenantId,
          institution_id: "institution-1",
          course_id: "course-1",
          module_id: "module-1",
          assignment_id: "assignment-1",
          learner_id: "student-1",
          status: "SUBMITTED",
          submission_text: "Work",
          attachment_url: null,
          is_late: false,
        }],
      };
    }
    if (text.startsWith("UPDATE lms_assignment_submissions")) {
      return {
        rows: [{
          id: "submission-1",
          learner_id: "student-1",
          status: "GRADED",
          grade: 49,
          submission_text: "Work",
          attachment_url: null,
          is_late: false,
        }],
      };
    }
    if (text.startsWith("INSERT INTO lms_assessment_completions")) {
      completionValues = values;
      return { rows: [{ id: "completion-1", passed: false }] };
    }
    return { rows: [] };
  });

  await service.gradeAssignmentSubmission("assignment-1", "submission-1", { grade: 49 }, reviewerRequest);

  assert.equal(completionValues?.[9], false);
});

test("learner assignment listings include only published content from enrolled courses", async () => {
  const learner: AuthenticatedUser = {
    ...user,
    id: "student-1",
    roles: [{ code: "STUDENT", name: "Student" }],
  };
  const queries: string[] = [];
  const { service } = serviceWith(async (text) => {
    queries.push(text);
    if (text.startsWith("SELECT course_id")) return { rows: [{ course_id: "course-1" }] };
    if (text.startsWith("SELECT a.id")) {
      return {
        rows: [{
          id: "assignment-1",
          tenant_id: learner.tenantId,
          institution_id: "institution-1",
          course_id: "course-1",
          module_id: "module-1",
          title: "Portfolio",
          status: "PUBLISHED",
        }],
      };
    }
    return { rows: [{ count: "1" }] };
  });

  const result = await service.listAssignments(learner, 1, 20, 0, {});

  assert.equal(result.data.length, 1);
  assert.ok(queries.some((query) => query.includes("c.status = 'PUBLISHED'")));
  assert.ok(queries.some((query) => query.includes("cm.status = 'PUBLISHED'")));
  assert.ok(queries.some((query) => query.includes("JOIN institutions i")));
});

test("LMS administrators bypass assignment staff-scope checks", async () => {
  let queryCount = 0;
  const { service } = serviceWith(async () => {
    queryCount += 1;
    return { rows: [] };
  });
  const hasAccess = await (service as unknown as {
    hasAssignmentStaffAccess: (user: AuthenticatedUser, institutionId: string, courseId: string, campusId?: string | null) => Promise<boolean>;
  }).hasAssignmentStaffAccess(user, "institution-outside-user-scope", "course-1", "campus-1");

  assert.equal(hasAccess, true);
  assert.equal(queryCount, 0);
});

test("LMS administrators can load learner assignment listings without a course filter", async () => {
  const queries: string[] = [];
  const { service } = serviceWith(async (text) => {
    queries.push(text);
    if (text.startsWith("SELECT a.id")) {
      return {
        rows: [{
          id: "assignment-1",
          tenant_id: user.tenantId,
          institution_id: "institution-1",
          course_id: "course-1",
          module_id: "module-1",
          title: "Portfolio",
          status: "DRAFT",
        }],
      };
    }
    return { rows: [{ count: "1" }] };
  });

  const result = await service.listAssignments(user, 1, 20, 0, {});

  assert.equal(result.data.length, 1);
  assert.equal(queries.some((query) => query.startsWith("SELECT course_id")), false);
  assert.equal(queries.some((query) => query.includes("a.course_id = ANY")), false);
});

test("learner assignment submissions reject blank work before touching the database", async () => {
  const learner: AuthenticatedUser = {
    ...user,
    id: "student-1",
    roles: [{ code: "STUDENT", name: "Student" }],
  };
  let queryCount = 0;
  const { service } = serviceWith(async () => {
    queryCount += 1;
    return { rows: [] };
  });

  await assert.rejects(
    service.submitAssignment("assignment-1", { submissionText: " \n\t " }, { context: { ...request.context, user: learner } } as unknown as ContextRequest),
    BadRequestException,
  );
  assert.equal(queryCount, 0);
});

test("graded learner assignment submissions cannot be replaced", async () => {
  const learner: AuthenticatedUser = {
    ...user,
    id: "student-1",
    roles: [{ code: "STUDENT", name: "Student" }],
  };
  const assignment = {
    id: "assignment-1",
    tenant_id: learner.tenantId,
    institution_id: "institution-1",
    course_id: "course-1",
    module_id: "module-1",
    title: "Portfolio",
    assessment_type: "ASSIGNMENT",
    status: "PUBLISHED",
    course_status: "PUBLISHED",
    module_status: "PUBLISHED",
    programme_status: "PUBLISHED",
    institution_status: "ACTIVE",
    total_marks: "100",
    due_at: null,
  };
  let insertAttempted = false;
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT a.*")) return { rows: [assignment] };
    if (text.startsWith("SELECT e.id, e.tenant_id")) return { rows: [{ id: "enrollment-1" }] };
    if (text.startsWith("SELECT * FROM lms_assignment_submissions")) {
      return { rows: [{ id: "submission-1", status: "GRADED", grade: 90 }] };
    }
    if (text.startsWith("INSERT INTO lms_assignment_submissions")) insertAttempted = true;
    return { rows: [] };
  });

  await assert.rejects(
    service.submitAssignment("assignment-1", { submissionText: "New work" }, { context: { ...request.context, user: learner } } as unknown as ContextRequest),
    ConflictException,
  );
  assert.equal(insertAttempted, false);
});

test("assignment grades cannot exceed the configured maximum", async () => {
  const reviewer: AuthenticatedUser = {
    ...user,
    roles: [{ code: "CITIS_ADMIN", name: "CITIS Admin" }],
  };
  const reviewerRequest = { context: { ...request.context, user: reviewer } } as unknown as ContextRequest;
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT a.*")) return { rows: [{ id: "assignment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", assessment_type: "ASSIGNMENT", status: "PUBLISHED", course_status: "PUBLISHED", module_status: "PUBLISHED", total_marks: "50" }] };
    if (text.includes("FROM user_roles")) return { rows: [{ allowed: 1 }] };
    return { rows: [] };
  });

  await assert.rejects(
    service.gradeAssignmentSubmission("assignment-1", "submission-1", { grade: 51 }, reviewerRequest),
    BadRequestException,
  );
});

test("assignment access rejects a student enrollment from another college or campus", async () => {
  const learner: AuthenticatedUser = {
    ...user,
    id: "student-1",
    roles: [{ code: "STUDENT", name: "Student" }],
    studentType: "COLLEGE_STUDENT",
  };
  const assignment = {
    id: "assignment-1",
    tenant_id: learner.tenantId,
    institution_id: "institution-1",
    campus_id: "campus-1",
    course_id: "course-1",
    module_id: "module-1",
    assessment_type: "ASSIGNMENT",
    status: "PUBLISHED",
    course_status: "PUBLISHED",
    module_status: "PUBLISHED",
    programme_status: "PUBLISHED",
    institution_status: "ACTIVE",
  };
  const { service } = serviceWith(async (text) => {
    if (text.startsWith("SELECT a.*")) return { rows: [assignment] };
    if (text.startsWith("SELECT e.id")) return { rows: [] };
    return { rows: [] };
  });

  await assert.rejects(service.getAssignment("assignment-1", learner), ForbiddenException);
});

test("assignment access is bound to the authenticated learner and preserves staff access", async () => {
  const assignment = {
    id: "assignment-1",
    tenant_id: user.tenantId,
    institution_id: "institution-1",
    campus_id: null,
    course_id: "course-1",
    module_id: "module-1",
    assessment_type: "ASSIGNMENT",
    status: "PUBLISHED",
    course_status: "PUBLISHED",
    module_status: "PUBLISHED",
    programme_status: "PUBLISHED",
    institution_status: "ACTIVE",
  };
  let enrollmentLearnerId: unknown;
  const learner: AuthenticatedUser = {
    ...user,
    id: "student-2",
    roles: [{ code: "STUDENT", name: "Student" }],
    studentType: "DIRECT_STUDENT",
  };
  const { service } = serviceWith(async (text, values) => {
    if (text.startsWith("SELECT a.*")) return { rows: [assignment] };
    if (text.startsWith("SELECT e.id")) {
      enrollmentLearnerId = values[2];
      return values[2] === "student-1" ? { rows: [{ id: "enrollment-1" }] } : { rows: [] };
    }
    return { rows: [] };
  });

  await assert.rejects(service.getAssignment("assignment-1", learner), ForbiddenException);
  assert.equal(enrollmentLearnerId, "student-2");

  const adminResult = await service.getAssignment("assignment-1", user);
  assert.equal(adminResult.id, "assignment-1");
});