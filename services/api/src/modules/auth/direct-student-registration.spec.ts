import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { BadRequestException, ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { OtpDeliveryService } from "./otp-delivery.service";

const metadata = { ipAddress: "127.0.0.1", userAgent: "test" };
const OTP_TEST_SECRET = "direct-student-otp-test-secret";
process.env.SESSION_SECRET = OTP_TEST_SECRET;

function otpHash(code: string) {
  return createHmac("sha256", OTP_TEST_SECRET).update(code).digest("hex");
}

type FakeChallenge = {
  id: string;
  tenantId: string;
  contact: string;
  channel: string;
  codeHash: string;
  registrationFirstName: string | null;
  registrationLastName: string | null;
  registrationPasswordHash: string | null;
  consumed: boolean;
  attempts: number;
  sequence: number;
};

type FakeQuery = (
  text: string,
  values?: unknown[],
) => Promise<{ rows: Array<Record<string, unknown>> }>;

function createRegistrationTestDatabase(initialUserExists = false) {
  const statements: Array<{ text: string; values: unknown[] }> = [];
  const challenges: FakeChallenge[] = [];
  let userExists = initialUserExists;
  let challengeSequence = 0;
  let sessionCount = 0;

  const query: FakeQuery = async (text, values = []) => {
    statements.push({ text, values });

    if (text.includes("SELECT id FROM tenants")) return { rows: [{ id: "tenant-1" }] };
    if (text.includes("SELECT pg_advisory_xact_lock")) return { rows: [] };
    if (text.includes("SELECT 1 FROM users") || text.includes("SELECT id FROM users")) {
      return { rows: userExists ? [{ id: "existing-user" }] : [] };
    }
    if (text.includes("SELECT id, registration_first_name")) {
      const hashes = text.includes("code_hash = ANY") ? values[3] as string[] : null;
      const challenge = challenges
        .filter((candidate) =>
          candidate.tenantId === String(values[0]) &&
          candidate.contact === String(values[1]) &&
          !candidate.consumed &&
          candidate.attempts < 5 &&
          (!hashes || hashes.includes(candidate.codeHash)),
        )
        .sort((left, right) => right.sequence - left.sequence)[0];
      return {
        rows: challenge
          ? [{
              id: challenge.id,
              registration_first_name: challenge.registrationFirstName,
              registration_last_name: challenge.registrationLastName,
              registration_password_hash: challenge.registrationPasswordHash,
            }]
          : [],
      };
    }
    if (text.includes("INSERT INTO auth_challenges")) {
      const id = `challenge-${++challengeSequence}`;
      challenges.push({
        id,
        tenantId: String(values[0]),
        contact: String(values[2]),
        channel: String(values[3]),
        codeHash: String(values[4]),
        registrationFirstName: values[5] == null ? null : String(values[5]),
        registrationLastName: values[6] == null ? null : String(values[6]),
        registrationPasswordHash: values[7] == null ? null : String(values[7]),
        consumed: false,
        attempts: 0,
        sequence: challengeSequence,
      });
      return { rows: [{ id }] };
    }
    if (text.includes("UPDATE auth_challenges SET attempts = attempts + 1")) {
      for (const challenge of challenges) {
        if (!challenge.consumed && challenge.contact === String(values[1])) challenge.attempts += 1;
      }
      return { rows: [] };
    }
    if (text.includes("UPDATE auth_challenges") && text.includes("WHERE id = $1")) {
      const challenge = challenges.find((candidate) => candidate.id === String(values[0]));
      if (challenge) {
        challenge.consumed = true;
        challenge.registrationPasswordHash = null;
      }
      return { rows: [] };
    }
    if (text.includes("UPDATE auth_challenges") && text.includes("WHERE tenant_id = $1 AND contact = $2")) {
      for (const challenge of challenges) {
        if (
          challenge.tenantId === String(values[0]) &&
          challenge.contact === String(values[1]) &&
          !challenge.consumed
        ) {
          challenge.consumed = true;
          challenge.registrationPasswordHash = null;
        }
      }
      return { rows: [] };
    }
    if (text.includes("SELECT id FROM roles")) return { rows: [{ id: "student-role" }] };
    if (text.includes("INSERT INTO users")) {
      userExists = true;
      return { rows: [{ id: "new-user" }] };
    }
    if (text.includes("INSERT INTO auth_sessions")) {
      sessionCount += 1;
      return { rows: [] };
    }
    return { rows: [] };
  };

  return {
    db: {
      query,
      transaction: async (work: (client: { query: FakeQuery }) => Promise<unknown>) => work({ query }),
    },
    statements,
    challenges,
    get sessionCount() {
      return sessionCount;
    },
    get userExists() {
      return userExists;
    },
  };
}

function noOpLimiter() {
  return {
    assertAllowed: () => undefined,
    record: () => undefined,
    clear: () => undefined,
  };
}

test("direct registration accepts email-only contact and never returns the OTP", async () => {
  let delivered: { channel: string; destination: string; code: string } | undefined;
  const queries: string[] = [];
  const db = {
    query: async (text: string) => {
      queries.push(text);
      if (text.includes("SELECT id FROM tenants")) return { rows: [{ id: "tenant-1" }] };
      if (text.includes("SELECT 1 FROM users")) return { rows: [] };
      if (text.includes("INSERT INTO auth_challenges")) return { rows: [{ id: "challenge-1" }] };
      return { rows: [] };
    },
  };
  const delivery = {
    deliver: async (input: { channel: string; destination: string; code: string }) => {
      delivered = input;
    },
  };
  const service = new AuthService(db as never, noOpLimiter() as never, delivery as never);

  const response = await service.registerDirectStudent({
    email: "Student@Example.com",
    password: "StrongPass1!",
    firstName: "Direct",
    lastName: "Student",
  }, metadata);

  assert.deepEqual(response, { accepted: true, channel: "EMAIL", expiresInSeconds: 600 });
  assert.equal(delivered?.channel, "EMAIL");
  assert.equal(delivered?.destination, "student@example.com");
  assert.match(delivered?.code ?? "", /^\d{6}$/);
  assert.equal(JSON.stringify(response).includes(delivered?.code ?? "never"), false);
  assert.equal(queries.some((query) => query.includes("registration_password_hash")), true);
});

test("direct registration accepts phone-only contact and rejects both or neither contact", async () => {
  let deliveredChannel = "";
  const db = {
    query: async (text: string) => {
      if (text.includes("SELECT id FROM tenants")) return { rows: [{ id: "tenant-1" }] };
      if (text.includes("SELECT 1 FROM users")) return { rows: [] };
      if (text.includes("INSERT INTO auth_challenges")) return { rows: [{ id: "challenge-1" }] };
      return { rows: [] };
    },
  };
  const service = new AuthService(db as never, noOpLimiter() as never, {
    deliver: async (input: { channel: string }) => {
      deliveredChannel = input.channel;
    },
  } as never);

  await service.registerDirectStudent({
    mobile: "+91 98765 43210",
    password: "StrongPass1!",
    firstName: "Direct",
  }, metadata);
  assert.equal(deliveredChannel, "SMS");
  await assert.rejects(
    service.registerDirectStudent({
      email: "student@example.com",
      mobile: "+919876543210",
      password: "StrongPass1!",
      firstName: "Direct",
    }, metadata),
    BadRequestException,
  );
  await assert.rejects(
    service.registerDirectStudent({
      password: "StrongPass1!",
      firstName: "Direct",
    }, metadata),
    BadRequestException,
  );
});

test("valid direct-student OTP creates an institutionless account and session", async () => {
  const statements: string[] = [];
  const db = {
    query: async (text: string) => {
      statements.push(text);
      if (text.includes("SELECT id FROM tenants")) return { rows: [{ id: "tenant-1" }] };
      if (text.includes("INSERT INTO auth_sessions")) return { rows: [] };
      return { rows: [] };
    },
    transaction: async (work: (client: { query: (text: string) => Promise<{ rows: Record<string, unknown>[] }> }) => Promise<unknown>) => {
      const client = {
        query: async (text: string) => {
          statements.push(text);
          if (text.includes("SELECT id, registration_first_name")) {
            return {
              rows: [{
                id: "challenge-1",
                registration_first_name: "Direct",
                registration_last_name: "Student",
                registration_password_hash: "bcrypt-hash",
              }],
            };
          }
          if (text.includes("SELECT id FROM roles")) return { rows: [{ id: "student-role" }] };
          if (text.includes("INSERT INTO users")) return { rows: [{ id: "user-1" }] };
          return { rows: [] };
        },
      };
      return work(client);
    },
  };
  const service = new AuthService(db as never, noOpLimiter() as never, { deliver: async () => undefined } as never);

  const session = await service.verifyDirectStudentOtp({
    email: "student@example.com",
    code: "123456",
  }, metadata);

  assert.ok(session.token);
  assert.equal(statements.some((statement) => statement.includes("'DIRECT_STUDENT'")), true);
  assert.equal(statements.some((statement) => statement.includes("institution_id")), true);
  assert.equal(statements.some((statement) => statement.includes("INSERT INTO user_roles")), true);
});

test("invalid direct-student OTP is rejected and does not create a session", async () => {
  let sessionCreated = false;
  const db = {
    query: async (text: string) => {
      if (text.includes("SELECT id FROM tenants")) return { rows: [{ id: "tenant-1" }] };
      if (text.includes("INSERT INTO auth_sessions")) sessionCreated = true;
      return { rows: [] };
    },
    transaction: async (work: (client: { query: (text: string) => Promise<{ rows: never[] }> }) => Promise<unknown>) => {
      const client = { query: async () => ({ rows: [] as never[] }) };
      return work(client);
    },
  };
  const service = new AuthService(db as never, noOpLimiter() as never, { deliver: async () => undefined } as never);

  await assert.rejects(
    service.verifyDirectStudentOtp({ mobile: "+919876543210", code: "000000" }, metadata),
    UnauthorizedException,
  );
  assert.equal(sessionCreated, false);
});