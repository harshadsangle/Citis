import assert from "node:assert/strict";
import test from "node:test";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { AcademicStructureService } from "./academic-structure.service";

const user: AuthenticatedUser = {
  id: "staff-1",
  tenantId: "tenant-1",
  email: "staff@example.test",
  firstName: "Staff",
  lastName: "User",
  roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
  permissions: ["lms.course_offering.create"],
  scopes: [{ institutionId: "institution-1", campusId: null }],
};

const request = {
  context: { requestId: "request-1", user },
} as unknown as ContextRequest;

function makeService(query: (sql: string, values: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>) {
  const audits: Array<Record<string, unknown>> = [];
  const service = new AcademicStructureService(
    { query } as never,
    { record: async (event: Record<string, unknown>) => { audits.push(event); } } as never,
  );
  return { service, audits };
}

test("department creation requires an active faculty in the same institution", async () => {
  const statements: string[] = [];
  const { service } = makeService(async (sql) => {
    statements.push(sql);
    if (sql.includes("academic_faculties")) return { rows: [] };
    return { rows: [{ id: "department-1" }] };
  });

  await assert.rejects(
    service.create("departments", {
      institutionId: "institution-1",
      facultyId: "faculty-other",
      name: "Computing",
      code: "CS",
    }, request),
    (error) => error instanceof NotFoundException,
  );
  assert.equal(statements.length, 1);
  assert.match(statements[0], /institution_id = \$3 AND status = 'ACTIVE'/);
});

test("department creation inserts the validated faculty relationship and audits it", async () => {
  const statements: Array<{ sql: string; values: unknown[] }> = [];
  const { service, audits } = makeService(async (sql, values) => {
    statements.push({ sql, values });
    if (sql.includes("academic_faculties")) return { rows: [{ campus_id: null }] };
    return { rows: [{ id: "department-1", institution_id: "institution-1", faculty_id: "faculty-1" }] };
  });

  const created = await service.create("departments", {
    institutionId: "institution-1",
    facultyId: "faculty-1",
    name: "Computing",
    code: "cs",
  }, request);
  assert.equal(created.id, "department-1");
  assert.match(statements[1].sql, /faculty_id/);
  assert.ok(statements[1].values.includes("faculty-1"));
  assert.equal(audits.length, 1);
});

test("offering creation accepts courses allocated to the selected institution", async () => {
  const statements: Array<{ sql: string; values: unknown[] }> = [];
  const { service } = makeService(async (sql, values) => {
    statements.push({ sql, values });
    if (sql.includes("academic_semesters")) return { rows: [{ campus_id: null }] };
    if (sql.includes("FROM courses")) return { rows: [{ campus_id: null, institution_id: "institution-owner" }] };
    if (sql.includes("INSERT INTO academic_course_offerings")) return { rows: [{ id: "offering-1" }] };
    return { rows: [] };
  });

  const created = await service.create("course-offerings", {
    institutionId: "institution-1",
    courseId: "course-1",
    semesterId: "semester-1",
    section: "A",
  }, request);

  assert.equal(created.id, "offering-1");
  const courseCheck = statements.find((entry) => entry.sql.includes("FROM courses"));
  assert.ok(courseCheck);
  assert.match(courseCheck.sql, /lms_course_institution_allocations/);
  assert.deepEqual(courseCheck.values, ["course-1", "tenant-1", "institution-1"]);
});

test("course options only reveal active courses allocated to the scoped institution", async () => {
  let statement = "";
  const { service } = makeService(async (sql) => {
    statement = sql;
    return {
      rows: [{
        id: "course-1",
        institution_id: "institution-owner",
        campus_id: null,
        title: "Allocated course",
        code: "ALLOC-1",
      }],
    };
  });

  const options = await service.courseOptions(user, "institution-1");
  assert.deepEqual(options, [{ id: "course-1", title: "Allocated course", code: "ALLOC-1" }]);
  assert.match(statement, /allocation\.status = 'ACTIVE'/);
});

test("academic updates reject records outside the actor's institution scope", async () => {
  const { service } = makeService(async () => ({
    rows: [{ id: "faculty-1", tenant_id: "tenant-1", institution_id: "institution-2", campus_id: null }],
  }));

  await assert.rejects(
    service.update("faculties", "faculty-1", { name: "Updated" }, request),
    (error) => error instanceof ForbiddenException,
  );
});