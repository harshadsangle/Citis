import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import test from "node:test";
import { HttpException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthRateLimiter } from "./auth.rate-limit";

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

test("mobile OTP IP limits are independent across tenants sharing the same IP", async () => {
  let challengeId = 0;
  const db = {
    query: async (text: string, values: unknown[] = []) => {
      if (text.includes("SELECT id FROM tenants")) return { rows: [{ id: `id-${values[0]}` }] };
      if (text.includes("RETURNING id")) return { rows: [{ id: `challenge-${++challengeId}` }] };
      return { rows: [] };
    },
    transaction: async (operation: (client: { query: () => Promise<{ rows: unknown[] }> }) => unknown) =>
      operation({ query: async () => ({ rows: [] }) }),
  };
  const service = new AuthService(db as never, new AuthRateLimiter() as never, {
    deliver: async () => undefined,
  } as never);
  const mobileFor = (index: number) => `+9198765432${String(index).padStart(2, "0")}`;

  for (let index = 0; index < 10; index += 1) {
    await service.requestOtp({ mobile: mobileFor(index), tenantSlug: "tenant-a" }, metadata);
  }
  await assert.rejects(
    service.requestOtp({ mobile: mobileFor(10), tenantSlug: "tenant-a" }, metadata),
    (error: unknown) => error instanceof HttpException && error.getStatus() === 429,
  );
  assert.deepEqual(
    await service.requestOtp({ mobile: mobileFor(11), tenantSlug: "tenant-b" }, metadata),
    { accepted: true, expiresInSeconds: 600 },
  );

  for (let index = 0; index < 20; index += 1) {
    await assert.rejects(
      service.verifyOtp({ mobile: mobileFor(index), tenantSlug: "tenant-a", code: "wrong" }, metadata),
      UnauthorizedException,
    );
  }
  await assert.rejects(
    service.verifyOtp({ mobile: mobileFor(20), tenantSlug: "tenant-a", code: "wrong" }, metadata),
    (error: unknown) => error instanceof HttpException && error.getStatus() === 429,
  );
  await assert.rejects(
    service.verifyOtp({ mobile: mobileFor(21), tenantSlug: "tenant-b", code: "wrong" }, metadata),
    UnauthorizedException,
  );
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

test("concurrent mobile OTP verification consumes one tenant-scoped challenge exactly once", async () => {
  const code = "a1b2c3";
  let consumed = false;
  let consumeStatements = 0;
  let consumeTransitions = 0;
  let sessionCount = 0;
  const verificationQueries: Array<{ text: string; values: unknown[] }> = [];
  const consumedAtSelection: boolean[] = [];
  const challenge = {
    id: "challenge-concurrent",
    user_id: "user-1",
    code_hash: hash(code),
    attempts: 0,
  };

  let rowLockQueue: Promise<void> = Promise.resolve();
  async function acquireChallengeLock() {
    let release!: () => void;
    const previous = rowLockQueue;
    rowLockQueue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    return release;
  }

  let releaseUnserializedReads!: () => void;
  const bothUnserializedReads = new Promise<void>((resolve) => {
    releaseUnserializedReads = resolve;
  });
  let unserializedReadCount = 0;

  const db = {
    query: async (text: string) => {
      if (text.includes("INSERT INTO auth_sessions")) sessionCount += 1;
      return { rows: [] };
    },
    transaction: async (
      operation: (client: {
        query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }>;
      }) => Promise<unknown>,
    ) => {
      let releaseLock: (() => void) | undefined;
      const client = {
        query: async (text: string, values?: unknown[]) => {
          if (text.includes("SELECT c.id, u.id AS user_id, c.code_hash, c.attempts")) {
            verificationQueries.push({ text, values: values ?? [] });
            if (text.includes("FOR UPDATE OF c")) {
              releaseLock = await acquireChallengeLock();
              consumedAtSelection.push(consumed);
              return { rows: consumed ? [] : [challenge] };
            }

            // Force both unlocked SELECTs to observe the unconsumed row before either UPDATE.
            const rowWasAvailable = !consumed;
            unserializedReadCount += 1;
            if (unserializedReadCount === 2) releaseUnserializedReads();
            await bothUnserializedReads;
            consumedAtSelection.push(!rowWasAvailable);
            return { rows: rowWasAvailable ? [challenge] : [] };
          }
          if (text.includes("SET consumed_at = now()")) {
            consumeStatements += 1;
            if (!consumed) {
              consumed = true;
              consumeTransitions += 1;
            }
          }
          return { rows: [] };
        },
      };
      try {
        return await operation(client);
      } finally {
        releaseLock?.();
      }
    },
  };
  const service = new AuthService(db as never, noOpLimiter() as never, {} as never);
  const input = { mobile, tenantSlug: "demo", code };

  const results = await Promise.allSettled([
    service.verifyOtp(input, metadata),
    service.verifyOtp(input, metadata),
  ]);

  const successes = results.filter((result) => result.status === "fulfilled");
  const failures = results.filter((result) => result.status === "rejected");
  assert.equal(successes.length, 1);
  assert.equal(failures.length, 1);
  assert.match(String((failures[0] as PromiseRejectedResult).reason), /Invalid or expired verification code/);
  assert.equal(consumed, true);
  assert.equal(consumeStatements, 1);
  assert.equal(consumeTransitions, 1);
  assert.equal(sessionCount, 1);
  assert.deepEqual(consumedAtSelection.sort(), [false, true]);
  assert.equal(verificationQueries.length, 2);
  for (const query of verificationQueries) {
    assert.match(query.text, /t\.slug = \$2/);
    assert.deepEqual(query.values, [mobile, "demo"]);
  }
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