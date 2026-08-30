import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../../database/database.service";
import type { AuthenticatedUser } from "../../common/request-context";
import type { LoginDto, OtpRequestDto, OtpVerifyDto } from "./auth.dto";
export declare class AuthService {
    private readonly db;
    private readonly config;
    constructor(db: DatabaseService, config: ConfigService);
    login(input: LoginDto, metadata: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        token: string;
        expiresAt: Date;
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
