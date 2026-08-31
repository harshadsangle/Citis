import type { AuthenticatedUser } from "./request-context";
export interface AccessScope {
    institutionId: string;
    campusId: string | null;
}
export declare function isPlatformUser(user: AuthenticatedUser): boolean;
export declare function canAccessScope(user: AuthenticatedUser, institutionId: string, campusId?: string | null): boolean;
export declare function assertScope(user: AuthenticatedUser, institutionId: string, campusId?: string | null): void;
export declare function assertScopeForRead(user: AuthenticatedUser, institutionId: string, campusId?: string | null): void;
export declare function filterScopedRows<T extends Record<string, unknown>>(user: AuthenticatedUser, rows: T[], institutionKey?: string, campusKey?: string): T[];
