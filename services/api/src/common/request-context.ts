import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  email: string | null;
  firstName: string;
  lastName: string;
  roles: Array<{ code: string; name: string }>;
  permissions: string[];
}

export interface RequestContext {
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
  user?: AuthenticatedUser;
}

export type ContextRequest = Request & { context: RequestContext };

export function requestContextMiddleware(request: Request, response: Response, next: NextFunction) {
  const requestId = request.header("x-request-id")?.trim() || randomUUID();
  const contextRequest = request as ContextRequest;
  contextRequest.context = {
    requestId,
    ipAddress: request.ip,
    userAgent: request.header("user-agent") || undefined,
  };
  response.setHeader("X-Request-ID", requestId);
  next();
}