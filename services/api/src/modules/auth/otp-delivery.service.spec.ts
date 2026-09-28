import assert from "node:assert/strict";
import test from "node:test";
import { OtpDeliveryService } from "./otp-delivery.service";

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