import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";

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

type ResendErrorDetails = {
  providerName: string | null;
  providerCode: string | null;
  providerMessage: string | null;
};

function textValue(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) {
    const strings = value.filter((item): item is string => typeof item === "string");
    return strings.length ? strings.join("; ") : null;
  }
  return null;
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

async function readResendError(response: Response): Promise<ResendErrorDetails> {
  let body = "";
  try {
    body = await response.text();
  } catch {
    // Keep the existing delivery failure response if the provider body is unreadable.
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return { providerName: null, providerCode: null, providerMessage: body || null };
  }

  const payload = recordValue(parsed);
  if (!payload) return { providerName: null, providerCode: null, providerMessage: body || null };
  const nestedError = recordValue(payload.error);
  return {
    providerName: textValue(payload.name) ?? textValue(payload.type) ?? textValue(nestedError?.name),
    providerCode: textValue(payload.code) ?? textValue(nestedError?.code),
    providerMessage:
      textValue(payload.message) ??
      textValue(nestedError?.message) ??
      textValue(payload.error) ??
      (body || null),
  };
}

function sanitizeDiagnosticText(
  value: string | null,
  sensitiveValues: readonly (string | undefined)[],
): string | null {
  if (!value) return null;

  let sanitized = value;
  for (const sensitiveValue of sensitiveValues) {
    if (sensitiveValue) sanitized = sanitized.split(sensitiveValue).join("[REDACTED]");
  }

  sanitized = sanitized
    .replace(/\bYour CITIS verification code\b[\s\S]*/i, "[email content omitted]")
    .replace(
      /"(?:authorization|x-api-key|(?:resend[_-]?)?api[_-]?key|session[_-]?secret|access[_-]?token)"\s*:\s*"[^"]*"/gi,
      '"[REDACTED_HEADER_OR_CREDENTIAL]"',
    )
    .replace(
      /\b(?:authorization|x-api-key|(?:resend[_-]?)?api[_-]?key|session[_-]?secret|access[_-]?token)\b\s*[:=]\s*(?:(?:Bearer|Basic)\s+)?(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
      "[REDACTED_HEADER_OR_CREDENTIAL]",
    )
    .replace(/\b(?:Bearer|Basic)\s+[A-Za-z0-9+/_.=-]+/gi, "[REDACTED_HEADER_VALUE]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
    .replace(/\b\d{6}\b/g, "[REDACTED_CODE]")
    .replace(/[\r\n\t]+/g, " ")
    .trim();

  if (sanitized.length > 300) sanitized = sanitized.slice(0, 300);
  return sanitized || null;
}

@Injectable()
export class OtpDeliveryService {
  private readonly logger = new Logger(OtpDeliveryService.name);

  async deliver(input: OtpDeliveryInput, runtime: OtpDeliveryRuntime = {}) {
    if (input.channel === "EMAIL") {
      const environment = runtime.environment ?? process.env;
      const apiKey = environment.RESEND_API_KEY;
      const from = environment.EMAIL_OTP_FROM;
      if (!apiKey || !from) {
        throw new ServiceUnavailableException("Email verification delivery is not configured.");
      }

      const emailBody = `Your CITIS verification code is ${input.code}. It expires in 10 minutes. If you did not request this code, you can ignore this message.`;
      const sensitiveValues = [
        emailBody,
        apiKey,
        environment.SESSION_SECRET,
        input.code,
        input.destination,
        from,
      ];
      let response: Response;
      try {
        response = await (runtime.fetchImpl ?? fetch)("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [input.destination],
            subject: "Your CITIS verification code",
            text: emailBody,
          }),
          signal: AbortSignal.timeout(10_000),
        });
      } catch (error) {
        this.logResendFailure(
          null,
          error instanceof Error ? error.name : null,
          null,
          error instanceof Error ? error.message : null,
          sensitiveValues,
        );
        throw new ServiceUnavailableException("Email verification delivery is temporarily unavailable.");
      }
      if (!response.ok) {
        const providerError = await readResendError(response);
        this.logResendFailure(
          response.status,
          providerError.providerName,
          providerError.providerCode,
          providerError.providerMessage,
          sensitiveValues,
        );
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

  private logResendFailure(
    statusCode: number | null,
    providerName: string | null,
    providerCode: string | null,
    providerMessage: string | null,
    sensitiveValues: readonly (string | undefined)[],
  ) {
    const diagnostic = {
      event: "resend_email_delivery_failed",
      statusCode,
      providerName: sanitizeDiagnosticText(providerName, sensitiveValues),
      providerCode: sanitizeDiagnosticText(providerCode, sensitiveValues),
      providerMessage: sanitizeDiagnosticText(providerMessage, sensitiveValues),
    };

    try {
      this.logger.warn(JSON.stringify(diagnostic));
    } catch {
      // Logging must not change the existing 503 response.
    }
  }
}