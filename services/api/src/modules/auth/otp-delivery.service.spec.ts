import assert from "node:assert/strict";
import test from "node:test";
import { OtpDeliveryService } from "./otp-delivery.service";

test("email delivery sends the OTP through Resend without returning it", async () => {
  let requestUrl = "";
  let requestInit: RequestInit | undefined;
  const service = new OtpDeliveryService();

  await service.deliver(
    { channel: "EMAIL", destination: "student@example.com", code: "083219", purpose: "REGISTER" },
    {
      environment: {
        RESEND_API_KEY: "test-resend-key",
        EMAIL_OTP_FROM: "CITIS <verification@example.com>",
      },
      fetchImpl: async (input, init) => {
        requestUrl = String(input);
        requestInit = init;
        return new Response(null, { status: 202 });
      },
    },
  );

  assert.equal(requestUrl, "https://api.resend.com/emails");
  assert.equal(new Headers(requestInit?.headers).get("Authorization"), "Bearer test-resend-key");
  const message = JSON.parse(String(requestInit?.body)) as {
    from: string;
    to: string[];
    subject: string;
    text: string;
    code?: string;
  };
  assert.equal(message.from, "CITIS <verification@example.com>");
  assert.deepEqual(message.to, ["student@example.com"]);
  assert.match(message.subject, /verification code/i);
  assert.match(message.text, /083219/);
  assert.equal("code" in message, false);
});

test("email delivery fails closed when Resend configuration is missing in development", async () => {
  let attemptedNetworkRequest = false;
  const service = new OtpDeliveryService();

  await assert.rejects(
    service.deliver(
      { channel: "EMAIL", destination: "student@example.com", code: "123456", purpose: "REGISTER" },
      {
        environment: { NODE_ENV: "development" },
        fetchImpl: async () => {
          attemptedNetworkRequest = true;
          return new Response(null, { status: 202 });
        },
      },
    ),
    /Email verification delivery is not configured/,
  );

  assert.equal(attemptedNetworkRequest, false);
});

test("email delivery hides provider and network failures behind a retryable error", async () => {
  const service = new OtpDeliveryService();
  const runtime = {
    environment: {
      RESEND_API_KEY: "test-resend-key",
      EMAIL_OTP_FROM: "CITIS <verification@example.com>",
    },
  };

  await assert.rejects(
    service.deliver(
      { channel: "EMAIL", destination: "student@example.com", code: "123456", purpose: "REGISTER" },
      { ...runtime, fetchImpl: async () => new Response(null, { status: 401 }) },
    ),
    /Email verification delivery is temporarily unavailable/,
  );
  await assert.rejects(
    service.deliver(
      { channel: "EMAIL", destination: "student@example.com", code: "123456", purpose: "REGISTER" },
      { ...runtime, fetchImpl: async () => { throw new Error("provider response contains sensitive details"); } },
    ),
    (error: unknown) => {
      assert.match(String(error), /Email verification delivery is temporarily unavailable/);
      assert.doesNotMatch(String(error), /sensitive details/);
      return true;
    },
  );
});

test("SMS delivery fails closed when Twilio configuration is missing", async () => {
  let attemptedNetworkRequest = false;
  const service = new OtpDeliveryService();

  await assert.rejects(
    service.deliver(
      { channel: "SMS", destination: "", code: "", purpose: "LOGIN" },
      {
        environment: { NODE_ENV: "development" },
        fetchImpl: async () => {
          attemptedNetworkRequest = true;
          return new Response();
        },
      },
    ),
    /SMS verification delivery is not configured/,
  );

  assert.equal(attemptedNetworkRequest, false);
});