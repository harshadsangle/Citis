import assert from "node:assert/strict";
import test from "node:test";
import { ForbiddenException } from "@nestjs/common";
import type { AuthenticatedUser } from "../../common/request-context";
import { ReportService } from "./report.service";

const admin: AuthenticatedUser = {
  id: "admin-1",
  tenantId: "tenant-1",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  roles: [{ code: "CITIS_ADMIN", name: "CITIS Admin" }],
  permissions: ["lms.report.view", "lms.report.export"],
  scopes: [],
};

const instructor: AuthenticatedUser = {
  ...admin,
  id: "instructor-1",
  roles: [{ code: "INSTRUCTOR", name: "Instructor" }],
  permissions: [],
};

test("global reports reject instructors", async () => {
  const service = new ReportService({ query: async () => ({ rows: [] }) } as never);
  await assert.rejects(service.run("students", {}, instructor), ForbiddenException);
});

test("admin CSV exports filtered rows with safe escaping", async () => {
  const db = {
    query: async () => ({
      rows: [{
        id: "student-1",
        student_type: "DIRECT_STUDENT",
        institution_name: 'Academy, "Main"',
        college_user_id: null,
        status: "ACTIVE",
        created_at: "2026-09-01T00:00:00.000Z",
        last_login_at: null,
      }],
    }),
  };
  const service = new ReportService(db as never);

  const result = await service.csv("students", {}, admin);

  assert.match(result.content, /institution_name/);
  assert.match(result.content, /"Academy, ""Main"""/);
  assert.doesNotMatch(result.content, /password|otp|secret/i);
});

test("unsupported report names are rejected", async () => {
  const service = new ReportService({ query: async () => ({ rows: [] }) } as never);
  await assert.rejects(service.run("credentials", {}, admin));
});