import type { Request, Response } from "express";
import type { ContextRequest } from "../../common/request-context";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto, LoginDto, OtpRequestDto, OtpVerifyDto, ProviderDto, RegisterDto, ResetPasswordDto } from "./auth.dto";
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    login(input: LoginDto, request: ContextRequest, response: Response): Promise<import("../../common/response").ApiSuccess<{
        expiresAt: string;
    }>>;
    register(input: RegisterDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        developmentVerificationToken?: string | undefined;
        accepted: boolean;
        status: string;
        role: "learner" | "instructor" | "admin";
        requiresApproval: boolean;
    }>>;
    forgotPassword(input: ForgotPasswordDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        developmentResetToken?: string | undefined;
        accepted: boolean;
    }>>;
    resetPassword(token: string, input: ResetPasswordDto, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        reset: boolean;
    }>>;
    verifyEmail(token: string, request: ContextRequest): Promise<import("../../common/response").ApiSuccess<{
        verified: boolean;
        status: string;
        requiresApproval: boolean;
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
