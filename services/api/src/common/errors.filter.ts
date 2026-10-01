import { Catch, type ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";
import type { ContextRequest } from "./request-context";

const REDACTED = "[redacted]";
const PRODUCTION_DIAGNOSTIC_MAX_LENGTH = 200;

/**
 * Values that must never reach the production log stream. Applied to the
 * diagnostic text only; the HTTP response below is built separately and is
 * unaffected by any of this.
 */
const SENSITIVE_PATTERNS: readonly RegExp[] = [
  // Absolute POSIX and Windows filesystem paths, e.g. /srv/app/data.ts, C:\app\x.ts.
  /(?:[A-Za-z]:)?[\\/][\w.\-\\/ ]*\.[A-Za-z]{1,6}\b/g,
  // Email addresses.
  /[\w.+-]+@[\w-]+\.[\w.-]+/g,
  // UUIDs: tenant, user and resource identifiers.
  /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g,
  // Opaque credentials: long hex, base64 or JWT-shaped tokens.
  /\b[A-Za-z0-9_-]{32,}\b/g,
  // Labelled secrets, e.g. password=..., Bearer <token>, api_key: <value>.
  /\b(?:password|passwd|token|secret|authorization|cookie|api[_-]?key)\b\s*[:=]?\s*\S+/gi,
];

// A statement fragment is too entangled to redact piecemeal, so withhold it.
// Covers bare SQL keywords and the shapes Postgres/Node drivers actually raise.
const DATABASE_ERROR =
  /\b(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|DROP\s+TABLE|ALTER\s+TABLE|FROM|WHERE|JOIN|VALUES|relation\s+"|column\s+"|duplicate key\b|syntax error\b|violates\b|foreign key\b|constraint\b|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|connection terminated|pool timeout|too many connections)\b/i;

function redact(value: string): string {
  return SENSITIVE_PATTERNS.reduce((result, pattern) => result.replace(pattern, REDACTED), value);
}

/**
 * Enough of a 500 to identify the failing backend path — exception name and a
 * sanitized, truncated message — without the raw text or the stack.
 */
function productionDiagnostic(exception: unknown, message: string): string {
  const name = exception instanceof Error ? exception.name : typeof exception;
  if (DATABASE_ERROR.test(`${name} ${message}`)) {
    return `${name}: database or connection failure (details withheld)`;
  }
  const detail = redact(message).trim() || "no message";
  return `${name}: ${detail}`.slice(0, PRODUCTION_DIAGNOSTIC_MAX_LENGTH);
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<ContextRequest>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const exceptionName = exception instanceof Error ? exception.name : typeof exception;
      const exceptionMessage = exception instanceof Error ? exception.message : String(exception);
      const stack = exception instanceof Error ? exception.stack : undefined;
      const logRecord = {
        event: "api_exception",
        requestId: request.context?.requestId || "unknown",
        statusCode: status,
        exceptionName,
        // Production keeps a sanitized diagnostic so a 500 is identifiable,
        // but never the raw message or stack. Development is unchanged.
        ...(process.env.NODE_ENV === "production"
          ? { diagnostic: productionDiagnostic(exception, exceptionMessage) }
          : { exceptionMessage, stack: stack || "unavailable" }),
      };
      console.error(JSON.stringify(logRecord));
    }
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const payload = typeof exceptionResponse === "string" ? { message: exceptionResponse } : exceptionResponse;
    const message = typeof payload === "object" && payload && "message" in payload
      ? Array.isArray(payload.message) ? payload.message.join(", ") : String(payload.message)
      : "An unexpected error occurred.";

    response.status(status).json({
      success: false,
      error: {
        code: typeof payload === "object" && payload && "error" in payload ? String(payload.error) : `HTTP_${status}`,
        message,
        details: typeof payload === "object" && payload && "details" in payload ? payload.details : undefined,
      },
      meta: { requestId: request.context?.requestId },
    });
  }
}