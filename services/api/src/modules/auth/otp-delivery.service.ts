import { Injectable, ServiceUnavailableException } from "@nestjs/common";

export type OtpChannel = "EMAIL" | "SMS";
export type OtpPurpose = "LOGIN" | "ENROLL" | "DISABLE" | "RESET" | "REGISTER";

type OtpDeliveryInput = {
  channel: OtpChannel;
  destination: string;
  code: string;
  purpose: OtpPurpose;
};

type OtpDeliveryRuntime = {
  environment?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
};

@Injectable()
export class OtpDeliveryService {
  async deliver(input: OtpDeliveryInput, runtime: OtpDeliveryRuntime = {}) {
    if (input.channel === "EMAIL") {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.EMAIL_OTP_FROM;
      if (!apiKey || !from) {
        return this.handleMissingConfiguration("Email OTP");
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [input.destination],
          subject: "Your CITIS verification code",
          text: `Your CITIS verification code is ${input.code}. It expires in 10 minutes. If you did not request this code, you can ignore this message.`,
        }),
      });
      if (!response.ok) {
        throw new ServiceUnavailableException("Email verification delivery is temporarily unavailable.");
      }
      return;
    }

    const environment = runtime.environment ?? process.env;
    const accountSid = environment.TWILIO_ACCOUNT_SID;
    const authToken = environment.TWILIO_AUTH_TOKEN;
    const from = environment.TWILIO_FROM_NUMBER;
    if (!accountSid || !authToken || !from) {
      throw new ServiceUnavailableException("SMS verification delivery is not configured.");
    }

    const body = new URLSearchParams({
      To: input.destination,
      From: from,
      Body: `Your CITIS verification code is ${input.code}. It expires in 10 minutes.`,
    });
    let response: Response;
    try {
      response = await (runtime.fetchImpl ?? fetch)(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
          signal: AbortSignal.timeout(10_000),
        },
      );
    } catch {
      throw new ServiceUnavailableException("SMS verification delivery is temporarily unavailable.");
    }
    if (!response.ok) {
      throw new ServiceUnavailableException("SMS verification delivery is temporarily unavailable.");
    }
  }

  private handleMissingConfiguration(channel: string) {
    if (process.env.NODE_ENV === "production") {
      throw new ServiceUnavailableException(`${channel} delivery is not configured.`);
    }
    // Local development and automated tests can exercise the full challenge
    // lifecycle without sending real messages. The code is never returned or
    // logged; production always requires a configured provider.
  }
}