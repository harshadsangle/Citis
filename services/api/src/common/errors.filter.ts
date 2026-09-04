import { Catch, type ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";
import type { ContextRequest } from "./request-context";

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
      console.error(
        `[TEMP_AUTH_DIAGNOSTIC] requestId=${request.context?.requestId || "unknown"} exceptionName=${exceptionName} exceptionMessage=${exceptionMessage} stack=${stack || "unavailable"}`,
      );
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