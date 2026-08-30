export type IdentityProvider = "EMAIL" | "MOBILE_OTP" | "GOOGLE" | "MICROSOFT" | "SSO";

export interface IdentityProviderAdapter {
  readonly provider: IdentityProvider;
  isConfigured(): boolean;
  getAuthorizationUrl(state: string): Promise<string>;
  exchangeCode(code: string): Promise<{ subject: string; email?: string; firstName?: string; lastName?: string }>;
}