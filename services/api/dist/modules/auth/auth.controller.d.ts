import type { Request, Response } from "express";
import type { ContextRequest } from "../../common/request-context";
import { AuthService } from "./auth.service";
import { LoginDto, OtpRequestDto, OtpVerifyDto, ProviderDto } from "./auth.dto";
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    login(input: LoginDto, request: ContextRequest, response: Response): Promise<{
        success: boolean;
        data: {
            expiresAt: string;
        };
        meta: {
            requestId?: string | undefined;
        };
    }>;
    logout(request: ContextRequest, response: Response): Promise<{
        success: boolean;
        data: {
            loggedOut: boolean;
        };
        meta: {
            requestId?: string | undefined;
        };
    }>;
    me(request: ContextRequest): {
        success: boolean;
        data: import("../../common/request-context").AuthenticatedUser | undefined;
        meta: {
            requestId?: string | undefined;
        };
    };
    requestOtp(input: OtpRequestDto, request: Request): Promise<{
        success: boolean;
        data: {
            accepted: boolean;
            expiresInSeconds: number;
        };
        meta: {
            requestId?: string | undefined;
        };
    }>;
    verifyOtp(input: OtpVerifyDto, request: ContextRequest, response: Response): Promise<{
        success: boolean;
        data: {
            expiresAt: string;
        };
        meta: {
            requestId?: string | undefined;
        };
    }>;
    providerStatus(input: ProviderDto, request: Request): {
        success: boolean;
        data: {
            provider: "google" | "microsoft" | "sso";
            configured: boolean;
            status: string;
        };
        meta: {
            requestId?: string | undefined;
        };
    };
}
