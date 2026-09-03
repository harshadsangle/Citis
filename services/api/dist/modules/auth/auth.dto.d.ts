export declare class LoginDto {
    email: string;
    password: string;
    tenantSlug?: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "learner" | "instructor" | "admin";
    tenantSlug?: string;
}
export declare class ForgotPasswordDto {
    email: string;
    tenantSlug?: string;
}
export declare class ResetPasswordDto {
    password: string;
}
export declare class OtpRequestDto {
    mobile: string;
    tenantSlug: string;
}
export declare class OtpVerifyDto extends OtpRequestDto {
    code: string;
}
export declare class ProviderDto {
    provider: "google" | "microsoft" | "sso";
}
