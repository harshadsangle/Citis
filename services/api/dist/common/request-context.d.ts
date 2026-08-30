import type { NextFunction, Request, Response } from "express";
export interface AuthenticatedUser {
    id: string;
    tenantId: string;
    email: string | null;
    firstName: string;
    lastName: string;
    roles: Array<{
        code: string;
        name: string;
    }>;
    permissions: string[];
}
export interface RequestContext {
    requestId: string;
    ipAddress?: string;
    userAgent?: string;
    user?: AuthenticatedUser;
}
export type ContextRequest = Request & {
    context: RequestContext;
};
export declare function requestContextMiddleware(request: Request, response: Response, next: NextFunction): void;
