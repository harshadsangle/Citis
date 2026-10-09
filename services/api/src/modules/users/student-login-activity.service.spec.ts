import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser } from "../../common/request-context";
import { dateKeyInTimeZone, StudentLoginActivityService } from "./student-login-activity.service";

const profile = {
  user_id: "student-1",
  tenant_id: "tenant-1",
  student_type: "COLLEGE_STUDENT" as const,
  institution_id: "institution-1",
  first_name: "Asha",
  last_name: "Learner",
  campus_time_zone: "Asia/Kolkata",
};

type TestProfile = Omit<typeof profile, "student_type" | "institution_id" | "campus_time_zone"> & {
  student_type: "COLLEGE_STUDENT" | "DIRECT_STUDENT";
  institution_id: string | null;
  campus_time_zone: string | null;
};

function actor(
  id: string,
  roles: string[],
  scopes: Array<{ institutionId: string; campusId: string | null }> = [],
): AuthenticatedUser {
  return {
    id,
    tenantId: "tenant-1",
    email: null,
    firstName: "Test",
    lastName: "User",
    studentType: null,
    roles: roles.map((code) => ({ code, name: code })),
    permissions: ["lms.student_profile.view"],
    scopes,
  };
}

function createService(options: {
  profile?: TestProfile | null;
  sessions?: Array<{ created_at: Date | string }>;
  latest?: { created_at: Date | string } | null;
  instructorAllowed?: boolean;
} = {}) {
  const calls: Array<{ sql: string; values?: unknown[] }> = [];
  const db = {
    query: async (sql: string, values?: unknown[]) => {
      calls.push({ sql, values });
      if (sql.includes("FROM lms_student_profiles sp")) {
        return { rows: options.profile === null ? [] : [options.profile ?? profile] };
      }
      if (sql.includes("FROM lms_instructor_colleges ic")) {
        return { rows: [{ allowed: options.instructorAllowed ?? false }] };
      }
      if (sql.includes("FROM auth_sessions") && sql.includes("ORDER BY created_at DESC")) {
        return { rows: options.latest ? [options.latest] : [] };
      }
      if (sql.includes("FROM auth_sessions")) {
        return { rows: options.sessions ?? [] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  return { service: new StudentLoginActivityService(db as never), calls };
}

test("reads real auth session timestamps, keeps duplicate same-day sign-ins, and excludes session metadata", async () => {
  const { service, calls } = createService({
    sessions: [
      { created_at: "2026-10-01T11:00:00.000Z" },
      { created_at: "2026-10-01T18:29:59.000Z" },
      { created_at: "2026-10-01T18:30:00.000Z" },
    ],
    latest: { created_at: "2026-10-01T18:30:00.000Z" },
  });

  const result = await service.getActivity(actor("student-1", ["STUDENT"]), "student-1", "2026-10");

  assert.equal(result.timeZone, "Asia/Kolkata");
  assert.equal(result.timeZoneSource, "campus");
  assert.equal(result.days.length, 2);
  assert.deepEqual(result.days.map((day) => [day.date, day.sessions.length]), [
    ["2026-10-01", 2],
    ["2026-10-02", 1],
  ]);
  assert.equal(result.summary.daysLoggedIn, 2);
  assert.equal(result.summary.totalSuccessfulSessions, 3);
  assert.equal(result.summary.lastLoginAt, "2026-10-01T18:30:00.000Z");

  const monthlyQuery = calls.find(({ sql }) => sql.includes("FROM auth_sessions") && sql.includes("make_date"));
  assert.ok(monthlyQuery);
  assert.match(monthlyQuery.sql, /AT TIME ZONE \$4/);
  assert.deepEqual(monthlyQuery.values, ["student-1", 2026, 10, "Asia/Kolkata"]);
  assert.match(monthlyQuery.sql, /SELECT created_at/);
  assert.match(monthlyQuery.sql, /created_at <= now\(\)/);
  assert.doesNotMatch(monthlyQuery.sql, /token_hash|ip_address|user_agent|revoked_at/);
  assert.equal(JSON.stringify(result).includes("token_hash"), false);
});

test("formats timestamps on the correct local calendar date across a daylight-saving boundary", () => {
  assert.equal(dateKeyInTimeZone(new Date("2026-03-08T04:59:59.000Z"), "America/New_York"), "2026-03-07");
  assert.equal(dateKeyInTimeZone(new Date("2026-03-08T05:00:00.000Z"), "America/New_York"), "2026-03-08");
});

test("allows a student to view only their own calendar and returns an empty month without inventing history", async () => {
  const { service } = createService();

  const result = await service.getActivity(actor("student-1", ["STUDENT"]), "student-1", "2026-09");

  assert.deepEqual(result.days, []);
  assert.deepEqual(result.summary, {
    daysLoggedIn: 0,
    totalSuccessfulSessions: 0,
    lastLoginAt: null,
  });
  assert.equal(result.month, "2026-09");
});

test("CITIS administrators can view college and direct students across tenant scope", async () => {
  const directProfile = { ...profile, student_type: "DIRECT_STUDENT" as const, institution_id: null, campus_time_zone: null };
  const { service, calls } = createService({ profile: directProfile });

  const result = await service.getActivity(actor("citis-admin", ["CITIS_ADMIN"]), "student-1", "2026-10");

  const profileQuery = calls.find(({ sql }) => sql.includes("FROM lms_student_profiles sp"));
  assert.deepEqual(profileQuery?.values, ["student-1", null]);
  assert.equal(result.student.studentType, "DIRECT_STUDENT");
  assert.equal(result.timeZone, "Asia/Kolkata");
  assert.equal(result.timeZoneSource, "platform-default");
});

test("institution administrators need institution-wide scope because student profiles do not identify a campus", async () => {
  const { service, calls } = createService();

  await assert.rejects(
    service.getActivity(
      actor("campus-admin", ["INSTITUTION_ADMINISTRATOR"], [
        { institutionId: "institution-1", campusId: "campus-1" },
      ]),
      "student-1",
      "2026-10",
    ),
    NotFoundException,
  );
  assert.equal(calls.some(({ sql }) => sql.includes("FROM auth_sessions")), false);
});

test("institution administrators can view learners in their institution-wide scope", async () => {
  const { service } = createService();

  const result = await service.getActivity(
    actor("institution-admin", ["INSTITUTION_ADMINISTRATOR"], [
      { institutionId: "institution-1", campusId: null },
    ]),
    "student-1",
    "2026-10",
  );

  assert.equal(result.student.firstName, "Asha");
});

test("instructors can view assigned-institution or actively enrolled assigned-course learners only", async () => {
  const { service, calls } = createService({ instructorAllowed: true });

  await service.getActivity(actor("teacher-1", ["TEACHER"]), "student-1", "2026-10");

  const assignmentQuery = calls.find(({ sql }) => sql.includes("FROM lms_instructor_colleges ic"));
  assert.ok(assignmentQuery);
  assert.match(assignmentQuery.sql, /lms_instructor_assignments/);
  assert.match(assignmentQuery.sql, /lms_enrollments/);

  const denied = createService({ instructorAllowed: false });
  await assert.rejects(
    denied.service.getActivity(actor("teacher-2", ["INSTRUCTOR"]), "student-1", "2026-10"),
    NotFoundException,
  );
  assert.equal(denied.calls.some(({ sql }) => sql.includes("FROM auth_sessions")), false);
});

test("rejects malformed month parameters", async () => {
  const { service, calls } = createService();

  await assert.rejects(
    service.getActivity(actor("student-1", ["STUDENT"]), "student-1", "2026-13"),
    BadRequestException,
  );
  assert.equal(calls.length, 0);
});

test("does not reveal whether an unknown user has a student profile", async () => {
  const { service, calls } = createService({ profile: null });

  await assert.rejects(
    service.getActivity(actor("citis-admin", ["CITIS_ADMIN"]), "missing-student", "2026-10"),
    NotFoundException,
  );
  assert.equal(calls.some(({ sql }) => sql.includes("FROM auth_sessions")), false);
});
