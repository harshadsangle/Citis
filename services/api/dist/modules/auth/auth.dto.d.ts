export declare class LoginDto {
    email: string;
    password: string;
    tenantSlug?: string;
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
