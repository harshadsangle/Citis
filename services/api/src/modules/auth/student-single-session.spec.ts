import assert from "node:assert/strict";
import test from "node:test";
import { ConflictException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { hashPassword } from "./password-security";

const PASSWORD = "StudentPass1!";
const PASSWORD_HASH = hashPassword(PASSWORD);
const METADATA = { ipAddress: "127.0.0.1", userAgent: "single-session-test" };

type StudentType = "COLLEGE_STUDENT" | "DIRECT_STUDENT" | null;
type AccountRole = "STUDENT" | "CITIS_ADMIN" | "INSTRUCTOR" | null;
type FakeSession = { id: string; userId: string; tokenHash: string; expiresAt: Date; revoked: boolean };

class AsyncLock {
  private tail = Promise.resolve();

  async acquire() {
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const previous = this.tail;
    this.tail = previous.then(() => current);
    await previous;
    return release;
  }
}

class SessionTestDatabase {
  private readonly userId = "learner-1";
  private readonly sessions: FakeSession[] = [];
  private readonly userLock = new AsyncLock();
  studentSessionChecks = 0;

  constructor(
    private readonly studentType: StudentType,
    private readonly passwordHash: string,
    private readonly roleCode: AccountRole = null,
  ) {}

  async query(text: string, values: unknown[] = []) {
    if (text.includes("lower(sp.college_user_id)")) {
      return { rows: [this.collegeLoginRow()] };
    }
    if (text.includes("FROM users u") && text.includes("JOIN tenants t")) {
      return { rows: [this.emailLoginRow()] };
    }
    if (text.includes("UPDATE auth_sessions SET revoked_at")) {
      const tokenHash = String(values[0]);
      for (const session of this.sessions) {
        if (session.tokenHash === tokenHash && !session.revoked) session.revoked = true;
      }
      return { rows: [] };
    }
    if (text.includes("UPDATE users SET last_login_at")) return { rows: [] };
    return { rows: [] };
  }

  async transaction<T>(work: (client: { query: (text: string, values?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }> }) => Promise<T>) {
    let release: (() => void) | undefined;
    const client = {
      query: async (text: string, values: unknown[] = []) => {
        if (text.includes("SELECT id FROM users WHERE id = $1 FOR UPDATE")) {
          release = await this.userLock.acquire();
          return { rows: [{ id: this.userId }] };
        }
        if (text.includes("FROM lms_student_profiles") && text.includes("student_type")) {
          const hasStudentProfile = this.studentType !== null;
          const hasStudentRole = text.includes("JOIN user_roles ur") && this.roleCode === "STUDENT";
          return {
            rows: hasStudentProfile
              ? [{ student_type: this.studentType }]
              : hasStudentRole
                ? [{ student_type: "STUDENT" }]
                : [],
          };
        }
        if (text.includes("FROM auth_sessions")) {
          this.studentSessionChecks += 1;
          const active = this.activeSessions()[0];
          return { rows: active ? [{ id: active.id }] : [] };
        }
        if (text.includes("INSERT INTO auth_sessions")) {
          this.sessions.push({
            id: `session-${this.sessions.length + 1}`,
            userId: String(values[0]),
            tokenHash: String(values[1]),
            expiresAt: new Date(String(values[2])),
            revoked: false,
          });
          return { rows: [] };
        }
        return { rows: [] };
      },
    };

    try {
      return await work(client);
    } finally {
      release?.();
    }
  }

  activeSessions() {
    const now = Date.now();
    return this.sessions.filter((session) => !session.revoked && session.expiresAt.getTime() > now);
  }

  private emailLoginRow() {
    return {
      id: this.userId,
      tenant_id: "tenant-1",
      email: "learner@example.test",
      first_name: "Test",
      last_name: "Learner",
      password_hash: this.passwordHash,
      mobile: null,
      mfa_enabled: false,
      mfa_channel: null,
      status: "ACTIVE",
      tenant_slug: "citis-platform",
    };
  }

  private collegeLoginRow() {
    return {
      id: this.userId,
      tenant_id: "tenant-1",
      email: null,
      password_hash: this.passwordHash,
      mfa_enabled: false,
      mfa_channel: null,
    };
  }
}

function makeService(studentType: StudentType, passwordHash: string, roleCode: AccountRole = null) {
  const db = new SessionTestDatabase(studentType, passwordHash, roleCode);
  return { db, service: new AuthService(
    db as never,
    { assertAllowed() {}, record() {}, clear() {} } as never,
    { deliver: async () => undefined } as never,
  ) };
}

function login(service: AuthService, studentType: Exclude<StudentType, null>) {
  return studentType === "COLLEGE_STUDENT"
    ? service.collegeStudentLogin({ collegeUserId: "COL-001", password: PASSWORD }, METADATA)
    : loginByEmail(service);
}

function loginByEmail(service: AuthService) {
  return service.login({ email: "learner@example.test", password: PASSWORD }, METADATA);
}

async function loginWithSession(service: AuthService, studentType: Exclude<StudentType, null>) {
  const result = await login(service, studentType);
  if ("mfaRequired" in result) throw new Error("The test account should not require MFA.");
  return result;
}

const STUDENT_TYPES: Exclude<StudentType, null>[] = ["COLLEGE_STUDENT", "DIRECT_STUDENT"];
const STAFF_ROLES: Exclude<AccountRole, "STUDENT" | null>[] = ["CITIS_ADMIN", "INSTRUCTOR"];

for (const studentType of STUDENT_TYPES) {
  test(`${studentType} login blocks another device without revoking the current session`, async () => {
    const passwordHash = await PASSWORD_HASH;
    const { db, service } = makeService(studentType, passwordHash);
    const first = await loginWithSession(service, studentType);
    const existingSessionIds = db.activeSessions().map(({ id }) => id);
    assert.deepEqual(existingSessionIds, ["session-1"]);

    await assert.rejects(
      login(service, studentType),
      (error: unknown) =>
        error instanceof ConflictException &&
        error.getStatus() === 409 &&
        error.message === "An active session already exists for this student account. Sign out of all existing sessions before signing in here.",
    );
    assert.deepEqual(db.activeSessions().map(({ id }) => id), existingSessionIds);

    await service.logout(first.token);
    assert.equal(db.activeSessions().length, 0);

    const afterLogout = await loginWithSession(service, studentType);
    assert.deepEqual(db.activeSessions().map(({ id }) => id), ["session-2"]);
  });

  test(`${studentType} simultaneous logins create only one active session`, async () => {
    const passwordHash = await PASSWORD_HASH;
    const { db, service } = makeService(studentType, passwordHash);
    const attempts = await Promise.allSettled([
      login(service, studentType),
      login(service, studentType),
    ]);

    assert.equal(attempts.filter((attempt) => attempt.status === "fulfilled").length, 1);
    const rejected = attempts.find((attempt) => attempt.status === "rejected");
    assert.ok(rejected && rejected.status === "rejected");
    assert.ok(rejected.reason instanceof ConflictException);
    assert.equal(db.activeSessions().length, 1);
    assert.equal(db.studentSessionChecks, 2);
  });
}

test("STUDENT role without a profile blocks a second login until logout", async () => {
  const passwordHash = await PASSWORD_HASH;
  const { db, service } = makeService(null, passwordHash, "STUDENT");
  const first = await loginByEmail(service);
  if ("mfaRequired" in first) throw new Error("The test account should not require MFA.");

  await assert.rejects(
    loginByEmail(service),
    (error: unknown) =>
      error instanceof ConflictException &&
      error.getStatus() === 409 &&
      error.message === "An active session already exists for this student account. Sign out of all existing sessions before signing in here.",
  );
  assert.deepEqual(db.activeSessions().map(({ id }) => id), ["session-1"]);

  await service.logout(first.token);
  assert.equal(db.activeSessions().length, 0);
});

test("STUDENT role without a profile still serializes simultaneous logins", async () => {
  const passwordHash = await PASSWORD_HASH;
  const { db, service } = makeService(null, passwordHash, "STUDENT");
  const attempts = await Promise.allSettled([loginByEmail(service), loginByEmail(service)]);

  assert.equal(attempts.filter((attempt) => attempt.status === "fulfilled").length, 1);
  const rejected = attempts.find((attempt) => attempt.status === "rejected");
  assert.ok(rejected && rejected.status === "rejected");
  assert.ok(rejected.reason instanceof ConflictException);
  assert.equal(db.activeSessions().length, 1);
  assert.equal(db.studentSessionChecks, 2);
});

for (const roleCode of STAFF_ROLES) {
  test(`${roleCode} accounts keep allowing concurrent sessions`, async () => {
    const passwordHash = await PASSWORD_HASH;
    const { db, service } = makeService(null, passwordHash, roleCode);
    const results = await Promise.all([loginByEmail(service), loginByEmail(service)]);

    assert.equal(results.length, 2);
    assert.equal(db.activeSessions().length, 2);
    assert.equal(db.studentSessionChecks, 0);
  });
}
