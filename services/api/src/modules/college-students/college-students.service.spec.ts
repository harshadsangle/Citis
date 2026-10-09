import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
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

const lmsEnrollmentStub = {
  enrollImportedCsvStudentInAllocatedCourses: async () => [],
  auditCreatedCsvEnrollments: async () => undefined,
};

test("CSV import keeps valid rows, reports duplicates and invalid rows, and never returns passwords", async () => {
  const auditEvents: Array<Record<string, unknown>> = [];
  const client = {
    query: async (text: string) => {
      if (text.startsWith("INSERT INTO lms_student_imports")) return { rows: [{ id: "import-1" }] };
      if (text.startsWith("SELECT id, name FROM institutions")) return { rows: [{ id: "institution-1", name: "North College" }] };
      if (text.startsWith("SELECT sp.user_id")) return { rows: [] };
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
  const service = new CollegeStudentsService(
    db as never,
    { record: async (event: Record<string, unknown>) => auditEvents.push(event) } as never,
    lmsEnrollmentStub as never,
  );
  const csv = [
    "College/University,College User ID,Student Name,Email,Phone,Password,Status",
    "North College,NC-001,Asha Sharma,asha@example.com,,StrongPass1!,Active",
    "North College,NC-001,Duplicate Student,,,StrongPass1!,Active",
    "North College,NC-002,Invalid Student,,,weak,Active",
  ].join("\n");

  const result = await service.importCsv(
    { originalname: "students.csv", mimetype: "text/csv", size: Buffer.byteLength(csv), buffer: Buffer.from(csv) },
    request,
    "institution-1",
  ) as Record<string, any>;
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
  const service = new CollegeStudentsService({} as never, {} as never, lmsEnrollmentStub as never);
  await assert.rejects(service.importCsv(undefined, instructorRequest), ForbiddenException);
});

test("college student imports return a bad request for an unclosed quoted field", async () => {
  const csv = 'College User ID,Student Name\nNC-001,"Asha Sharma';
  const service = new CollegeStudentsService({} as never, {} as never, lmsEnrollmentStub as never);

  await assert.rejects(
    service.importCsv({
      originalname: "students.csv",
      mimetype: "text/csv",
      size: Buffer.byteLength(csv),
      buffer: Buffer.from(csv),
    }, request, "institution-1"),
    (error: unknown) => error instanceof BadRequestException
      && error.getStatus() === 400
      && /unclosed quoted field/i.test(error.message),
  );
});

test("an institution-scoped CSV import links rows by institution ID without requiring a college-name column", async () => {
  const writes: Array<{ text: string; values?: unknown[] }> = [];
  const enrollmentCalls: unknown[][] = [];
  const client = {
    query: async (text: string, values?: unknown[]) => {
      writes.push({ text, values });
      if (text.startsWith("SELECT id, name FROM institutions")) {
        return { rows: [{ id: "institution-1", name: "New College" }] };
      }
      if (text.startsWith("INSERT INTO lms_student_imports")) return { rows: [{ id: "import-2" }] };
      if (text.startsWith("SELECT sp.user_id")) return { rows: [] };
      if (text.startsWith("SELECT id FROM users")) return { rows: [] };
      if (text.startsWith("INSERT INTO users")) return { rows: [{ id: "student-2" }] };
      if (text.startsWith("SELECT id FROM roles")) return { rows: [{ id: "student-role" }] };
      return { rows: [] };
    },
  };
  const db = {
    transaction: async (work: (value: typeof client) => Promise<unknown>) => work(client),
    query: async (text: string) => {
      if (text.includes("FROM lms_student_imports WHERE")) {
        return { rows: [{ id: "import-2", status: "COMPLETED", total_rows: 1, imported_count: 1, updated_count: 0, duplicate_count: 0, invalid_count: 0, failed_count: 0 }] };
      }
      if (text.includes("FROM lms_student_import_rows")) {
        return { rows: [{ row_number: 2, college_name: "New College", college_user_id: "NC-100", institution_id: "institution-1", status: "IMPORTED", reason: null }] };
      }
      return { rows: [] };
    },
  };
  const service = new CollegeStudentsService(
    db as never,
    { record: async () => undefined } as never,
    {
      enrollImportedCsvStudentInAllocatedCourses: async (...args: unknown[]) => {
        enrollmentCalls.push(args);
        return [];
      },
      auditCreatedCsvEnrollments: async () => undefined,
    } as never,
  );
  const csv = [
    "College User ID,Student Name,Email,Phone,Password,Status",
    "NC-100,Asha Sharma,asha@example.com,,StrongPass1!,Active",
  ].join("\n");

  const result = await service.importCsv(
    { originalname: "students.csv", mimetype: "text/csv", size: Buffer.byteLength(csv), buffer: Buffer.from(csv) },
    request,
    "institution-1",
  ) as Record<string, any>;

  assert.equal(result.status, "COMPLETED");
  assert.equal(result.imported_count, 1);
  const roleLookup = writes.find(({ text }) => text.startsWith("SELECT id FROM roles"));
  const roleAssignment = writes.find(({ text }) => text.startsWith("INSERT INTO user_roles"));
  const studentProfile = writes.find(({ text }) => text.startsWith("INSERT INTO lms_student_profiles"));
  assert.deepEqual(roleLookup?.values, ["tenant-1", "STUDENT"]);
  assert.deepEqual(roleAssignment?.values, ["tenant-1", "student-2", "student-role", "institution-1"]);
  assert.deepEqual(studentProfile?.values, ["tenant-1", "student-2", "institution-1", "NC-100", "ACTIVE"]);
  assert.equal(roleAssignment?.values?.[3], "institution-1");
  assert.equal(studentProfile?.values?.[2], "institution-1");
  assert.equal(enrollmentCalls.length, 1);
  assert.equal(enrollmentCalls[0][1], "institution-1");
  assert.equal(enrollmentCalls[0][2], "student-2");
});

test("CSV imports require the institution selected by the administrator", async () => {
  const service = new CollegeStudentsService({} as never, {} as never, lmsEnrollmentStub as never);
  const csv = "College User ID,Student Name,Password,Status\nNC-100,Asha Sharma,StrongPass1!,Active";

  await assert.rejects(
    service.importCsv(
      { originalname: "students.csv", mimetype: "text/csv", size: Buffer.byteLength(csv), buffer: Buffer.from(csv) },
      request,
    ),
    (error: unknown) => error instanceof BadRequestException && /select an institution/i.test(error.message),
  );
});

test("a re-import can safely move an existing college student and its STUDENT role to the selected institution", async () => {
  const writes: Array<{ text: string; values?: unknown[] }> = [];
  const priorStudent = {
    user_id: "student-existing",
    student_type: "COLLEGE_STUDENT",
    institution_id: "institution-old",
    college_user_id: "NC-100",
    email: "asha@example.com",
    mobile: "+919876543210",
  };
  const client = {
    query: async (text: string, values?: unknown[]) => {
      writes.push({ text, values });
      if (text.startsWith("SELECT id, name FROM institutions")) {
        return { rows: [{ id: "institution-new", name: "South College" }] };
      }
      if (text.startsWith("INSERT INTO lms_student_imports")) return { rows: [{ id: "import-move" }] };
      if (text.startsWith("SELECT sp.user_id") && text.includes("sp.institution_id = $2")) return { rows: [] };
      if (text.startsWith("SELECT sp.user_id") && text.includes("sp.institution_id <> $2")) return { rows: [priorStudent] };
      if (text.startsWith("SELECT sp.user_id") && text.includes("lower(u.email)")) return { rows: [priorStudent] };
      if (text.startsWith("SELECT id FROM users")) return { rows: [] };
      if (text.startsWith("SELECT id FROM roles")) return { rows: [{ id: "student-role" }] };
      return { rows: [] };
    },
  };
  const db = {
    transaction: async (work: (value: typeof client) => Promise<unknown>) => work(client),
    query: async (text: string) => {
      if (text.includes("FROM lms_student_imports WHERE")) {
        return { rows: [{ id: "import-move", status: "COMPLETED", total_rows: 1, imported_count: 0, updated_count: 1, duplicate_count: 0, invalid_count: 0, failed_count: 0 }] };
      }
      if (text.includes("FROM lms_student_import_rows")) {
        return { rows: [{ row_number: 2, college_name: "South College", college_user_id: "NC-100", institution_id: "institution-new", user_id: "student-existing", status: "UPDATED", reason: null }] };
      }
      return { rows: [] };
    },
  };
  const enrollmentCalls: unknown[][] = [];
  const service = new CollegeStudentsService(
    db as never,
    { record: async () => undefined } as never,
    {
      enrollImportedCsvStudentInAllocatedCourses: async (...args: unknown[]) => {
        enrollmentCalls.push(args);
        return [];
      },
      auditCreatedCsvEnrollments: async () => undefined,
    } as never,
  );
  const csv = [
    "College User ID,Student Name,Email,Phone,Password,Status",
    "NC-100,Asha Sharma,asha@example.com,+919876543210,StrongPass1!,Active",
  ].join("\n");

  const result = await service.importCsv(
    { originalname: "students.csv", mimetype: "text/csv", size: Buffer.byteLength(csv), buffer: Buffer.from(csv) },
    request,
    "institution-new",
  ) as Record<string, any>;

  assert.equal(result.updated_count, 1);
  assert.equal(writes.some(({ text }) => text.startsWith("INSERT INTO users")), false);
  const userUpdate = writes.find(({ text }) => text.startsWith("UPDATE users"));
  assert.equal(userUpdate?.values?.[7], "student-existing");
  const profileUpdate = writes.find(({ text }) => text.startsWith("UPDATE lms_student_profiles"));
  assert.deepEqual(profileUpdate?.values, ["institution-new", "ACTIVE", "NC-100", "tenant-1", "student-existing"]);
  const movedRole = writes.find(({ text }) => text.startsWith("DELETE FROM user_roles"));
  assert.deepEqual(movedRole?.values, ["tenant-1", "student-existing", "STUDENT", "institution-new"]);
  assert.equal(writes.some(({ text }) => text.startsWith("DELETE FROM users") || text.startsWith("DELETE FROM lms_enrollments")), false);
  assert.equal(enrollmentCalls.length, 1);
  assert.equal(enrollmentCalls[0][1], "institution-new");
  assert.equal(enrollmentCalls[0][2], "student-existing");
});

test("ambiguous cross-institution College User IDs do not merge student accounts", async () => {
  const writes: string[] = [];
  const client = {
    query: async (text: string) => {
      writes.push(text);
      if (text.startsWith("SELECT id, name FROM institutions")) {
        return { rows: [{ id: "institution-new", name: "South College" }] };
      }
      if (text.startsWith("INSERT INTO lms_student_imports")) return { rows: [{ id: "import-ambiguous" }] };
      if (text.startsWith("SELECT sp.user_id") && text.includes("sp.institution_id = $2")) return { rows: [] };
      if (text.startsWith("SELECT sp.user_id") && text.includes("sp.institution_id <> $2")) {
        return {
          rows: [
            { user_id: "student-one", student_type: "COLLEGE_STUDENT", institution_id: "institution-one", college_user_id: "NC-100", email: null, mobile: null },
            { user_id: "student-two", student_type: "COLLEGE_STUDENT", institution_id: "institution-two", college_user_id: "NC-100", email: null, mobile: null },
          ],
        };
      }
      return { rows: [] };
    },
  };
  const db = {
    transaction: async (work: (value: typeof client) => Promise<unknown>) => work(client),
    query: async (text: string) => {
      if (text.includes("FROM lms_student_imports WHERE")) {
        return { rows: [{ id: "import-ambiguous", status: "FAILED", total_rows: 1, imported_count: 0, updated_count: 0, duplicate_count: 0, invalid_count: 1, failed_count: 0 }] };
      }
      if (text.includes("FROM lms_student_import_rows")) {
        return { rows: [{ row_number: 2, college_name: "South College", college_user_id: "NC-100", status: "INVALID", reason: "This College User ID is linked to multiple institutions; resolve the duplicate before importing it." }] };
      }
      return { rows: [] };
    },
  };
  const service = new CollegeStudentsService(db as never, { record: async () => undefined } as never, lmsEnrollmentStub as never);
  const csv = "College User ID,Student Name,Password,Status\nNC-100,Asha Sharma,StrongPass1!,Active";

  const result = await service.importCsv(
    { originalname: "students.csv", mimetype: "text/csv", size: Buffer.byteLength(csv), buffer: Buffer.from(csv) },
    request,
    "institution-new",
  ) as Record<string, any>;

  assert.equal(result.invalid_count, 1);
  assert.equal(writes.some((text) => text.startsWith("INSERT INTO users")), false);
  assert.equal(writes.some((text) => text.startsWith("UPDATE lms_student_profiles")), false);
});