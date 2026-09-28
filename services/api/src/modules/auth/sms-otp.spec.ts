import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import test from "node:test";
import { AuthService } from "./auth.service";

const metadata = { ipAddress: "127.0.0.1" };
const mobile = "+919876543210";

function noOpLimiter() {
  return {
    assertAllowed: () => undefined,
    record: () => undefined,
    clear: () => undefined,
  };
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

test("mobile OTP sends an SMS to the registered mobile number", async () => {
  const statements: string[] = [];
  let delivered: { channel: string; destination: string; code: string; purpose: string } | undefined;
  const db = {
    query: async (text: string) => {
      statements.push(text);
      if (text.includes("SELECT id FROM tenants")) return { rows: [{ id: "tenant-1" }] };
      if (text.includes("RETURNING id")) return { rows: [{ id: "challenge-1" }] };
      return { rows: [] };
    },
  };
  const service = new AuthService(db as never, noOpLimiter() as never, {
    deliver: async (input: typeof delivered) => {
      delivered = input;
    },
  } as never);

  const response = await service.requestOtp({ mobile, tenantSlug: "demo" }, metadata);

  assert.deepEqual(response, { accepted: true, expiresInSeconds: 600 });
  assert.equal(delivered?.channel, "SMS");
  assert.equal(delivered?.destination, mobile);
  assert.equal(delivered?.purpose, "LOGIN");
  assert.match(delivered?.code ?? "", /^[0-9a-f]{6}$/);
  assert.equal(statements.some((statement) => statement.includes("RETURNING id")), true);
});

test("failed mobile OTP delivery consumes the challenge and a retry creates a new challenge", async () => {
  const invalidated: string[] = [];
  const challengeIds = ["challenge-failed", "challenge-retry"];
  let insertCount = 0;
  let deliveryCount = 0;
  const db = {
    query: async (text: string, values?: unknown[]) => {
      if (text.includes("SELECT id FROM tenants")) return { rows: [{ id: "tenant-1" }] };
      if (text.includes("RETURNING id")) {
        const id = challengeIds[insertCount];
        insertCount += 1;
        return { rows: [{ id }] };
      }
      if (text.includes("WHERE id = $1 AND consumed_at IS NULL")) {
        invalidated.push(String(values?.[0]));
      }
      return { rows: [] };
    },
  };
  const service = new AuthService(db as never, noOpLimiter() as never, {
    deliver: async () => {
      deliveryCount += 1;
      if (deliveryCount === 1) throw new Error("SMS provider unavailable");
    },
  } as never);

  await assert.rejects(
    service.requestOtp({ mobile, tenantSlug: "demo" }, metadata),
    /SMS provider unavailable/,
  );
  const retryResponse = await service.requestOtp({ mobile, tenantSlug: "demo" }, metadata);

  assert.deepEqual(retryResponse, { accepted: true, expiresInSeconds: 600 });
  assert.deepEqual(invalidated, ["challenge-failed"]);
  assert.equal(insertCount, 2);
  assert.equal(deliveryCount, 2);
});

test("mobile OTP verification consumes a challenge once within its tenant", async () => {
  const code = "a1b2c3";
  let consumed = false;
  let sessionCount = 0;
  let verificationSql = "";
  const db = {
    query: async (text: string) => {
      if (text.includes("INSERT INTO auth_sessions")) sessionCount += 1;
      return { rows: [] };
    },
    transaction: async (operation: (client: { query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }> }) => unknown) =>
      operation({
        query: async (text: string) => {
          if (text.includes("SELECT c.id, u.id AS user_id, c.code_hash, c.attempts")) {
            verificationSql = text;
            return {
              rows: consumed ? [] : [{ id: "challenge-1", user_id: "user-1", code_hash: hash(code), attempts: 0 }],
            };
          }
          if (text.includes("SET consumed_at = now()")) consumed = true;
          return { rows: [] };
        },
      }),
  };
  const service = new AuthService(db as never, noOpLimiter() as never, {} as never);

  const session = await service.verifyOtp({ mobile, tenantSlug: "demo", code }, metadata);
  assert.equal(typeof session.token, "string");
  assert.equal(consumed, true);
  assert.match(verificationSql, /c\.channel = 'SMS'/);
  assert.match(verificationSql, /t\.slug = \$2/);
  assert.match(verificationSql, /c\.expires_at > now\(\)/);
  assert.match(verificationSql, /FOR UPDATE OF c/);

  await assert.rejects(
    service.verifyOtp({ mobile, tenantSlug: "demo", code }, metadata),
    /Invalid or expired verification code/,
  );
  assert.equal(sessionCount, 1);
});

test("expired mobile OTPs cannot create sessions", async () => {
  let sessionCount = 0;
  let verificationSql = "";
  const db = {
    query: async (text: string) => {
      if (text.includes("INSERT INTO auth_sessions")) sessionCount += 1;
      return { rows: [] };
    },
    transaction: async (operation: (client: { query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }> }) => unknown) =>
      operation({
        query: async (text: string) => {
          verificationSql = text;
          return { rows: [] };
        },
      }),
  };
  const service = new AuthService(db as never, noOpLimiter() as never, {} as never);

  await assert.rejects(
    service.verifyOtp({ mobile, tenantSlug: "demo", code: "a1b2c3" }, metadata),
    /Invalid or expired verification code/,
  );
  assert.match(verificationSql, /c\.expires_at > now\(\)/);
  assert.equal(sessionCount, 0);
});

test("mobile OTP verification increments attempts only on the selected challenge", async () => {
  const statements: Array<{ text: string; values?: unknown[] }> = [];
  const db = {
    query: async () => ({ rows: [] }),
    transaction: async (operation: (client: { query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }> }) => unknown) =>
      operation({
        query: async (text: string, values?: unknown[]) => {
          statements.push({ text, values });
          if (text.includes("SELECT c.id, u.id AS user_id, c.code_hash, c.attempts")) {
            return { rows: [{ id: "challenge-tenant-scoped", user_id: "user-1", code_hash: hash("correct"), attempts: 4 }] };
          }
          return { rows: [] };
        },
      }),
  };
  const service = new AuthService(db as never, noOpLimiter() as never, {} as never);

  await assert.rejects(
    service.verifyOtp({ mobile, tenantSlug: "demo", code: "wrong1" }, metadata),
    /Invalid or expired verification code/,
  );
  const attemptUpdate = statements.find(({ text }) => text.includes("SET attempts = attempts + 1"));
  assert.equal(attemptUpdate?.values?.[0], "challenge-tenant-scoped");
  assert.match(attemptUpdate?.text ?? "", /attempts \+ 1 >= 5/);
});