import assert from "node:assert/strict";
import test from "node:test";
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
    if (text.includes("FROM auth_sessions s") && text.includes("WHERE s.token_hash = $1")) {
      const tokenHash = String(values[0]);
      const session = this.sessions.find(
        (candidate) =>
          candidate.tokenHash === tokenHash &&
          !candidate.revoked &&
          candidate.expiresAt.getTime() > Date.now(),
      );
      return {
        rows: session
          ? [{
              id: this.userId,
              tenant_id: "tenant-1",
              email: "learner@example.test",
              first_name: "Test",
              last_name: "Learner",
              student_type: this.studentType,
              roles: this.roleCode === "STUDENT" ? [{ code: "STUDENT", name: "Student" }] : [],
              permissions: [],
              scopes: [],
            }]
          : [],
      };
    }
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
        if (text.includes("UPDATE auth_sessions") && text.includes("SET revoked_at")) {
          const userId = String(values[0]);
          const now = Date.now();
          for (const session of this.sessions) {
            if (
              session.userId === userId &&
              !session.revoked &&
              session.expiresAt.getTime() > now
            ) {
              session.revoked = true;
            }
          }
          return { rows: [] };
        }
        if (text.includes("FROM lms_student_profiles") && text.includes("student_type")) {
          this.studentSessionChecks += 1;
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
  test(`${studentType} login takes over the previous device session`, async () => {
    const passwordHash = await PASSWORD_HASH;
    const { db, service } = makeService(studentType, passwordHash);
    const first = await loginWithSession(service, studentType);
    const second = await loginWithSession(service, studentType);
    assert.deepEqual(db.activeSessions().map(({ id }) => id), ["session-2"]);
    assert.equal(await service.resolveSession(first.token), null);
    assert.ok(await service.resolveSession(second.token));

    await service.logout(second.token);
    assert.equal(db.activeSessions().length, 0);
    const afterLogout = await loginWithSession(service, studentType);
    assert.deepEqual(db.activeSessions().map(({ id }) => id), ["session-3"]);
  });

  test(`${studentType} simultaneous logins leave only the latest session active`, async () => {
    const passwordHash = await PASSWORD_HASH;
    const { db, service } = makeService(studentType, passwordHash);
    const sessions = await Promise.all([
      loginWithSession(service, studentType),
      loginWithSession(service, studentType),
    ]);
    assert.equal(sessions.length, 2);
    assert.equal(db.activeSessions().length, 1);
    assert.equal(db.studentSessionChecks, 2);
    const validSessions = await Promise.all(sessions.map(({ token }) => service.resolveSession(token)));
    assert.equal(validSessions.filter(Boolean).length, 1);
  });
}

test("STUDENT role without a profile takes over the previous session", async () => {
  const passwordHash = await PASSWORD_HASH;
  const { db, service } = makeService(null, passwordHash, "STUDENT");
  const first = await loginByEmail(service);
  if ("mfaRequired" in first) throw new Error("The test account should not require MFA.");
  const second = await loginByEmail(service);
  if ("mfaRequired" in second) throw new Error("The test account should not require MFA.");
  assert.deepEqual(db.activeSessions().map(({ id }) => id), ["session-2"]);
  assert.equal(await service.resolveSession(first.token), null);
  assert.ok(await service.resolveSession(second.token));
});

test("self-registered learner email verification activates a role-only single-session account", async () => {
  const statements: Array<{ text: string; values: unknown[] }> = [];
  const activeSessionHashes = new Set<string>();
  let accountCreated = false;
  let emailVerified = false;
  let studentRoleCreated = false;
  let registeredPasswordHash = "";
  const userId = "self-registered-learner";
  const db = {
    query: async (text: string, values: unknown[] = []) => {
      statements.push({ text, values });
      if (text.includes("SELECT id FROM tenants")) return { rows: [{ id: "tenant-1" }] };
      if (text.includes("FROM auth_sessions s") && text.includes("WHERE s.token_hash = $1")) {
        return {
          rows: activeSessionHashes.has(String(values[0]))
            ? [{
                id: userId,
                tenant_id: "tenant-1",
                email: "new-learner@example.test",
                first_name: "New",
                last_name: "Learner",
                student_type: null,
                roles: [{ code: "STUDENT", name: "Student" }],
                permissions: [],
                scopes: [],
              }]
            : [],
        };
      }
      if (text.includes("FROM users u") && text.includes("JOIN tenants t")) {
        return {
          rows: emailVerified
            ? [{
                id: userId,
                tenant_id: "tenant-1",
                email: "new-learner@example.test",
                first_name: "New",
                last_name: "Learner",
                password_hash: registeredPasswordHash,
                mobile: null,
                mfa_enabled: false,
                mfa_channel: null,
                status: "ACTIVE",
                tenant_slug: "citis-platform",
              }]
            : [],
        };
      }
      if (text.includes("UPDATE auth_sessions SET revoked_at")) {
        activeSessionHashes.delete(String(values[0]));
      }
      return { rows: [] };
    },
    transaction: async (work: (client: {
      query: (text: string, values?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>;
    }) => Promise<unknown>) => {
      const client = {
        query: async (text: string, values: unknown[] = []) => {
          statements.push({ text, values });
          if (text.includes("SELECT id FROM users WHERE tenant_id = $1 AND lower(email)")) {
            return { rows: [] };
          }
          if (text.includes("INSERT INTO users")) {
            accountCreated = true;
            registeredPasswordHash = String(values[2]);
            return { rows: [{ id: userId }] };
          }
          if (text.includes("SELECT id FROM roles")) {
            return { rows: [{ id: "student-role" }] };
          }
          if (text.includes("INSERT INTO user_roles")) {
            studentRoleCreated = true;
          }
          if (text.includes("SELECT v.id, v.user_id, r.code AS role_code")) {
            return {
              rows: accountCreated && studentRoleCreated
                ? [{ id: "verification-1", user_id: userId, role_code: "STUDENT" }]
                : [],
            };
          }
          if (text.includes("UPDATE users") && text.includes("email_verified_at")) {
            emailVerified = Boolean(values[0]);
          }
          if (text.includes("SELECT id FROM users WHERE id = $1 FOR UPDATE")) {
            return { rows: emailVerified ? [{ id: userId }] : [] };
          }
          if (text.includes("UPDATE auth_sessions") && text.includes("SET revoked_at")) {
            activeSessionHashes.clear();
            return { rows: [] };
          }
          if (text.includes("FROM lms_student_profiles") && text.includes("student_type")) {
            return { rows: studentRoleCreated ? [{ student_type: "STUDENT" }] : [] };
          }
          if (text.includes("INSERT INTO auth_sessions")) {
            activeSessionHashes.add(String(values[1]));
          }
          return { rows: [] };
        },
      };
      return work(client);
    },
  };
  const service = new AuthService(
    db as never,
    { assertAllowed() {}, record() {}, clear() {} } as never,
    { deliver: async () => undefined } as never,
  );

  const registration = await service.register({
    role: "learner",
    email: "new-learner@example.test",
    password: PASSWORD,
    firstName: "New",
    lastName: "Learner",
  }, METADATA);
  assert.equal(registration.status, "PENDING");
  const roleLookup = statements.find(({ text }) => text.includes("SELECT id FROM roles"));
  assert.deepEqual(roleLookup?.values, ["tenant-1", "STUDENT"]);

  const verification = await service.verifyEmail("a".repeat(43));
  assert.deepEqual(verification, { verified: true, status: "ACTIVE", requiresApproval: false });
  assert.equal(emailVerified, true);

  const first = await service.login({
    email: "new-learner@example.test",
    password: PASSWORD,
  }, METADATA);
  if ("mfaRequired" in first) throw new Error("The test account should not require MFA.");
  const second = await service.login({
    email: "new-learner@example.test",
    password: PASSWORD,
  }, METADATA);
  if ("mfaRequired" in second) throw new Error("The test account should not require MFA.");
  assert.equal(activeSessionHashes.size, 1);
  assert.equal(await service.resolveSession(first.token), null);
  assert.ok(await service.resolveSession(second.token));

  await service.logout(second.token);
  const afterLogout = await service.login({
    email: "new-learner@example.test",
    password: PASSWORD,
  }, METADATA);
  if ("mfaRequired" in afterLogout) throw new Error("The test account should not require MFA.");
  assert.equal(activeSessionHashes.size, 1);
});

test("STUDENT role without a profile still serializes simultaneous logins", async () => {
  const passwordHash = await PASSWORD_HASH;
  const { db, service } = makeService(null, passwordHash, "STUDENT");
  const sessions = await Promise.all([loginByEmail(service), loginByEmail(service)]);
  assert.ok(sessions.every((session) => !("mfaRequired" in session)));
  assert.equal(db.activeSessions().length, 1);
  assert.equal(db.studentSessionChecks, 2);
  const validSessions = await Promise.all(
    sessions.map((session) => service.resolveSession(session.token)),
  );
  assert.equal(validSessions.filter(Boolean).length, 1);
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
