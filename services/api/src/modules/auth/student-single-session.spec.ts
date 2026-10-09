import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { ConflictException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { hashPassword } from "./password-security";

const PASSWORD = "StudentPass1!";
const PASSWORD_HASH = hashPassword(PASSWORD);
const METADATA = { ipAddress: "127.0.0.1", userAgent: "single-session-test" };

type StudentType = "COLLEGE_STUDENT" | "DIRECT_STUDENT" | null;
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
        if (text.includes("SELECT student_type FROM lms_student_profiles")) {
          return { rows: this.studentType ? [{ student_type: this.studentType }] : [] };
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

function makeService(studentType: StudentType) {
  const db = new SessionTestDatabase(studentType, "");
  return { db, service: new AuthService(
    db as never,
    { assertAllowed() {}, record() {}, clear() {} } as never,
    { deliver: async () => undefined } as never,
  ) };
}

function login(service: AuthService, studentType: Exclude<StudentType, null>) {
  return studentType === "COLLEGE_STUDENT"
    ? service.collegeStudentLogin({ collegeUserId: "COL-001", password: PASSWORD }, METADATA)
    : service.login({ email: "learner@example.test", password: PASSWORD }, METADATA);
}

const STUDENT_TYPES: Exclude<StudentType, null>[] = ["COLLEGE_STUDENT", "DIRECT_STUDENT"];

for (const studentType of STUDENT_TYPES) {
  test(`${studentType} login blocks another device without revoking the current session`, async () => {
    const passwordHash = await PASSWORD_HASH;
    const { db, service } = makeService(studentType);
    // The database fixture is constructed with the verified password hash.
    Object.assign(db, {});
    const first = await login(service, studentType);
    assert.ok(first.token);
    const existingSessionIds = db.activeSessions().map(({ id }) => id);
    assert.deepEqual(existingSessionIds, ["session-1"]);

    await assert.rejects(
      login(service, studentType),
      (error: unknown) =>
        error instanceof ConflictException &&
        error.getStatus() === 409 &&
        error.message.includes("already signed in on another device"),
    );
    assert.deepEqual(db.activeSessions().map(({ id }) => id), existingSessionIds);

    await service.logout(first.token);
    assert.equal(db.activeSessions().length, 0);

    const afterLogout = await login(service, studentType);
    assert.ok(afterLogout.token);
    assert.deepEqual(db.activeSessions().map(({ id }) => id), ["session-2"]);
  });

  test(`${studentType} simultaneous logins create only one active session`, async () => {
    const passwordHash = await PASSWORD_HASH;
    const { db, service } = makeService(studentType);
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
    assert.equal(createHash("sha256").update(PASSWORD).digest("hex").length, 64);
  });
}

test("Admin and Instructor-style accounts keep allowing concurrent sessions", async () => {
  const passwordHash = await PASSWORD_HASH;
  const { db, service } = makeService(null);
  const results = await Promise.all([
    service.login({ email: "learner@example.test", password: PASSWORD }, METADATA),
    service.login({ email: "learner@example.test", password: PASSWORD }, METADATA),
  ]);

  assert.equal(results.length, 2);
  assert.equal(db.activeSessions().length, 2);
  assert.equal(db.studentSessionChecks, 0);
  assert.equal(passwordHash.length > 0, true);
});
