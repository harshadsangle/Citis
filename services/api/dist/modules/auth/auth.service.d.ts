import { DatabaseService } from "../../database/database.service";
import type { AuthenticatedUser } from "../../common/request-context";
import type { ForgotPasswordDto, LoginDto, OtpRequestDto, OtpVerifyDto, RegisterDto, ResetPasswordDto } from "./auth.dto";
export declare class AuthService {
    private readonly db;
    constructor(db: DatabaseService);
    login(input: LoginDto, metadata: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        token: string;
        expiresAt: Date;
    }>;
    register(input: RegisterDto, metadata: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        developmentVerificationToken?: string | undefined;
        accepted: boolean;
        status: string;
        role: "learner" | "instructor" | "admin";
        requiresApproval: boolean;
    }>;
    requestPasswordReset(input: ForgotPasswordDto, metadata: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        developmentResetToken?: string | undefined;
        accepted: boolean;
    }>;
    resetPassword(token: string, input: ResetPasswordDto): Promise<{
        reset: boolean;
    }>;
    verifyEmail(token: string): Promise<{
        verified: boolean;
        status: string;
        requiresApproval: boolean;
    }>;
    startSession(userId: string, metadata: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        token: string;
        expiresAt: Date;
    }>;
    resolveSession(token: string): Promise<AuthenticatedUser | null>;
    logout(token: string): Promise<void>;
    requestOtp(input: OtpRequestDto): Promise<{
        accepted: boolean;
        expiresInSeconds: number;
    }>;
    verifyOtp(input: OtpVerifyDto, metadata: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        token: string;
        expiresAt: Date;
    }>;
    providerStatus(provider: "google" | "microsoft" | "sso"): {
        provider: "google" | "microsoft" | "sso";
        configured: boolean;
        status: string;
    };
    static platformTenantId(): string;
}
