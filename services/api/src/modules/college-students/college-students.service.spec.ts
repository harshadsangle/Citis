import assert from "node:assert/strict";
import test from "node:test";
import { ForbiddenException } from "@nestjs/common";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { CollegeStudentsService } from "./college-students.service";

const admin: AuthenticatedUser = {
  id: "admin-1",
  tenantId: "tenant-1",
  email: "admin@example.com",
  firstName: "CITIS",
  lastName: "Admin",
  roles: [{ code: "CITIS_ADMIN", name: "CITIS Admin" }],
  permissions: ["lms.student_import.create"],
  scopes: [],
};

const request = {
  context: {
    requestId: "request-1",
    ipAddress: "127.0.0.1",
    userAgent: "test",
    user: admin,
  },
} as unknown as ContextRequest;

test("CSV import keeps valid rows, reports duplicates and invalid rows, and never returns passwords", async () => {
  const auditEvents: Array<Record<string, unknown>> = [];
  const client = {
    query: async (text: string) => {
      if (text.startsWith("INSERT INTO lms_student_imports")) return { rows: [{ id: "import-1" }] };
      if (text.startsWith("SELECT id FROM institutions")) return { rows: [{ id: "institution-1" }] };
      if (text.startsWith("SELECT user_id, student_type")) return { rows: [] };
      if (text.startsWith("SELECT id FROM users")) return { rows: [] };
      if (text.startsWith("INSERT INTO users")) return { rows: [{ id: "student-1" }] };
      if (text.startsWith("SELECT id FROM roles")) return { rows: [{ id: "student-role" }] };
      return { rows: [] };
    },
  };
  const db = {
    transaction: async (work: (value: typeof client) => Promise<unknown>) => work(client),
    query: async (text: string) => {
      if (text.includes("FROM lms_student_imports WHERE")) {
        return { rows: [{ id: "import-1", status: "PARTIAL", total_rows: 3, imported_count: 1, updated_count: 0, duplicate_count: 1, invalid_count: 1, failed_count: 0 }] };
      }
      if (text.includes("FROM lms_student_import_rows")) {
        return { rows: [{ row_number: 2, college_name: "North College", college_user_id: "NC-001", status: "IMPORTED", reason: null }] };
      }
      return { rows: [] };
    },
  };
  const service = new CollegeStudentsService(db as never, { record: async (event: Record<string, unknown>) => auditEvents.push(event) } as never);
  const csv = [
    "College/University,College User ID,Student Name,Email,Phone,Password,Status",
    "North College,NC-001,Asha Sharma,asha@example.com,,StrongPass1!,Active",
    "North College,NC-001,Duplicate Student,,,StrongPass1!,Active",
    "North College,NC-002,Invalid Student,,,weak,Active",
  ].join("\n");

  const result = await service.importCsv({ originalname: "students.csv", mimetype: "text/csv", size: Buffer.byteLength(csv), buffer: Buffer.from(csv) }, request);
  assert.equal(result.status, "PARTIAL");
  assert.equal(result.imported_count, 1);
  assert.equal(result.duplicate_count, 1);
  assert.equal(result.invalid_count, 1);
  assert.doesNotMatch(JSON.stringify(result), /StrongPass1!/);
  assert.doesNotMatch(JSON.stringify(auditEvents), /StrongPass1!/);
});

test("instructors cannot invoke the college student import API", async () => {
  const instructor = { ...admin, roles: [{ code: "INSTRUCTOR", name: "Instructor" }] };
  const instructorRequest = { context: { ...request.context, user: instructor } } as unknown as ContextRequest;
  const service = new CollegeStudentsService({} as never, {} as never);
  await assert.rejects(service.importCsv(undefined, instructorRequest), ForbiddenException);
});