import type { Request, Response } from "express";
import type { ContextRequest } from "../../common/request-context";
import { AuthService } from "./auth.service";
import { LoginDto, OtpRequestDto, OtpVerifyDto, ProviderDto } from "./auth.dto";
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    login(input: LoginDto, request: ContextRequest, response: Response): Promise<import("../../common/response").ApiSuccess<{
        expiresAt: string;
    }>>;
    logout(request: ContextRequest, response: Response): Promise<import("../../common/response").ApiSuccess<{
        loggedOut: boolean;
    }>>;
    me(request: ContextRequest): import("../../common/response").ApiSuccess<import("../../common/request-context").AuthenticatedUser | undefined>;
    requestOtp(input: OtpRequestDto, request: Request): Promise<import("../../common/response").ApiSuccess<{
        accepted: boolean;
        expiresInSeconds: number;
    }>>;
    verifyOtp(input: OtpVerifyDto, request: ContextRequest, response: Response): Promise<import("../../common/response").ApiSuccess<{
        expiresAt: string;
    }>>;
    providerStatus(input: ProviderDto, request: Request): import("../../common/response").ApiSuccess<{
        provider: "google" | "microsoft" | "sso";
        configured: boolean;
        status: string;
    }>;
}
