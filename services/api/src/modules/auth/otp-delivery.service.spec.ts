import assert from "node:assert/strict";
import test from "node:test";
import { ServiceUnavailableException } from "@nestjs/common";
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

test("Resend failure diagnostics preserve details while redacting credentials, OTP, recipient, headers, and email content", async () => {
  const apiKey = "test-resend-api-key-secret";
  const sessionSecret = "test-session-secret-value";
  const destination = "private.student+otp@example.com";
  const code = "083219";
  const emailBody = `Your CITIS verification code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this message.`;
  const providerMessage = [
    `Authorization: Bearer ${apiKey}`,
    `SESSION_SECRET=${sessionSecret}`,
    `code=${code}`,
    `recipient=${destination}`,
    `email_body=${emailBody}`,
  ].join("; ");
  const service = new OtpDeliveryService();
  const logger = (service as unknown as { logger: { warn: (message: string) => void } }).logger;
  const originalWarn = logger.warn;
  const warnings: string[] = [];
  logger.warn = (message) => warnings.push(message);

  const runtime = {
    environment: {
      RESEND_API_KEY: apiKey,
      SESSION_SECRET: sessionSecret,
      EMAIL_OTP_FROM: "CITIS <verification@example.com>",
    },
  };
  const assertGeneric503 = (error: unknown) => {
    assert.ok(error instanceof ServiceUnavailableException);
    assert.equal(error.getStatus(), 503);
    assert.equal(error.message, "Email verification delivery is temporarily unavailable.");
    return true;
  };

  try {
    await assert.rejects(
      service.deliver(
        { channel: "EMAIL", destination, code, purpose: "REGISTER" },
        {
          ...runtime,
          fetchImpl: async () =>
            new Response(
              JSON.stringify({
                name: "validation_error",
                code: "invalid_from_address",
                message: providerMessage,
              }),
              { status: 422 },
            ),
        },
      ),
      assertGeneric503,
    );

    await assert.rejects(
      service.deliver(
        { channel: "EMAIL", destination, code, purpose: "REGISTER" },
        {
          ...runtime,
          fetchImpl: async () => {
            throw new Error(providerMessage);
          },
        },
      ),
      assertGeneric503,
    );
  } finally {
    logger.warn = originalWarn;
  }

  assert.equal(warnings.length, 2);
  const diagnostics = warnings.map((warning) => JSON.parse(warning) as Record<string, unknown>);
  assert.deepEqual(Object.keys(diagnostics[0]), [
    "event",
    "statusCode",
    "providerName",
    "providerCode",
    "providerMessage",
  ]);
  assert.equal(diagnostics[0].event, "resend_email_delivery_failed");
  assert.equal(diagnostics[0].statusCode, 422);
  assert.equal(diagnostics[0].providerName, "validation_error");
  assert.equal(diagnostics[0].providerCode, "invalid_from_address");
  assert.equal(diagnostics[1].statusCode, null);
  assert.equal(diagnostics[1].providerName, "Error");

  const logOutput = warnings.join("\n");
  for (const sensitiveValue of [apiKey, sessionSecret, destination, code, "Authorization", "Bearer", "Your CITIS verification code"]) {
    assert.equal(logOutput.includes(sensitiveValue), false, `diagnostic log exposed ${sensitiveValue}`);
  }
  assert.match(String(diagnostics[0].providerMessage), /REDACTED/);
  assert.match(String(diagnostics[1].providerMessage), /REDACTED/);
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