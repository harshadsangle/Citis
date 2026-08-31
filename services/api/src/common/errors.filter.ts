import { Catch, type ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";
import type { ContextRequest } from "./request-context";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<ContextRequest>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    if (!(exception instanceof HttpException)) {
      console.error("Unhandled API exception:", exception instanceof Error ? exception.stack : exception);
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