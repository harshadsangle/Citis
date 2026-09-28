import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type { AccessScope } from "./access-scope";

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  email: string | null;
  firstName: string;
  lastName: string;
  roles: Array<{ code: string; name: string }>;
  studentType?: "COLLEGE_STUDENT" | "DIRECT_STUDENT" | null;
  permissions: string[];
  scopes: AccessScope[];
}

export interface RequestContext {
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
  user?: AuthenticatedUser;
}

export type ContextRequest = Request & { context: RequestContext };

export function requestContextMiddleware(request: Request, response: Response, next: NextFunction) {
  const candidate = request.header("x-request-id")?.trim();
  const requestId = candidate && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate)
    ? candidate
    : randomUUID();
  const contextRequest = request as ContextRequest;
  contextRequest.context = {
    requestId,
    ipAddress: request.ip,
    userAgent: request.header("user-agent") || undefined,
  };
  response.setHeader("X-Request-ID", requestId);
  next();
}