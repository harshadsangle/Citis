import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

const metadata = { ipAddress: "127.0.0.1", userAgent: "test" };

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