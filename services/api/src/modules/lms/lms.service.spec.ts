import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { LmsService } from "./lms.service";

const user: AuthenticatedUser = {
  id: "user-1",
  tenantId: "tenant-1",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
  permissions: ["lms.course.create", "lms.learning_resource.create", "lms.course.publish"],
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
  return { service: new LmsService(db as never, audit as never), audits };
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