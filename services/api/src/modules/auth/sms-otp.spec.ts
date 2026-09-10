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