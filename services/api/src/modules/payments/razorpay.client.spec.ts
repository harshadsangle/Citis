import assert from "node:assert/strict";
import test from "node:test";
import { ServiceUnavailableException } from "@nestjs/common";
import { RazorpayClient } from "./razorpay.client";

const razorpayEnvironmentKeys = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_BASE_URL",
  "RAZORPAY_TIMEOUT_MS",
] as const;

function saveRazorpayEnvironment() {
  return Object.fromEntries(razorpayEnvironmentKeys.map((key) => [key, process.env[key]]));
}

function restoreRazorpayEnvironment(previous: Record<string, string | undefined>) {
  for (const key of razorpayEnvironmentKeys) {
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function configureRazorpay(timeoutMs: string) {
  process.env.RAZORPAY_KEY_ID = "test-key-id";
  process.env.RAZORPAY_KEY_SECRET = "test-key-secret";
  process.env.RAZORPAY_BASE_URL = "https://razorpay.example.test/v1";
  process.env.RAZORPAY_TIMEOUT_MS = timeoutMs;
}

test("Razorpay requests include a bounded timeout and preserve successful response handling", async () => {
  const previousEnvironment = saveRazorpayEnvironment();
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestInit: RequestInit | undefined;
  try {
    configureRazorpay("30000");
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      requestUrl = String(input);
      requestInit = init;
      return new Response(JSON.stringify({
        id: "order-1",
        entity: "order",
        amount: 125000,
        currency: "INR",
        status: "created",
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }) as typeof fetch;

    const order = await new RazorpayClient().createOrder({
      amount: 125000,
      currency: "INR",
      receipt: "payment-1",
    });

    assert.equal(requestUrl, "https://razorpay.example.test/v1/orders");
    assert.equal(requestInit?.method, "POST");
    assert.ok(requestInit?.signal instanceof AbortSignal);
    assert.equal(requestInit?.signal?.aborted, false);
    assert.deepEqual(JSON.parse(String(requestInit?.body)), {
      amount: 125000,
      currency: "INR",
      receipt: "payment-1",
    });
    assert.equal(order.id, "order-1");
    assert.equal(order.amount, 125000);
  } finally {
    globalThis.fetch = originalFetch;
    restoreRazorpayEnvironment(previousEnvironment);
  }
});

test("Razorpay request timeouts become a controlled service-unavailable error", async () => {
  const previousEnvironment = saveRazorpayEnvironment();
  const originalFetch = globalThis.fetch;
  try {
    configureRazorpay("5");
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      const signal = init?.signal;
      if (!signal) throw new Error("Expected the Razorpay request to have a timeout signal.");
      return new Promise<Response>((_resolve, reject) => {
        const rejectForAbort = () => reject(signal.reason);
        if (signal.aborted) rejectForAbort();
        else signal.addEventListener("abort", rejectForAbort, { once: true });
      });
    }) as typeof fetch;

    await assert.rejects(
      new RazorpayClient().createOrder({ amount: 1, currency: "INR", receipt: "payment-timeout" }),
      (error: unknown) => error instanceof ServiceUnavailableException
        && error.getStatus() === 503
        && error.message === "Razorpay request timed out.",
    );
  } finally {
    globalThis.fetch = originalFetch;
    restoreRazorpayEnvironment(previousEnvironment);
  }
});