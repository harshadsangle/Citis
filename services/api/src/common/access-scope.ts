import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser } from "./request-context";

export interface AccessScope {
  institutionId: string;
  campusId: string | null;
}

export const LMS_ADMIN_ROLE_CODES = [
  "CITIS_SUPER_ADMIN",
  "CITIS_PLATFORM_SUPPORT",
  "INSTITUTION_ADMINISTRATOR",
  "PRINCIPAL_DIRECTOR",
  "ACADEMIC_ADMINISTRATOR",
] as const;

export function isLmsAdministrator(user: AuthenticatedUser) {
  return user.roles.some((role) => LMS_ADMIN_ROLE_CODES.includes(role.code as typeof LMS_ADMIN_ROLE_CODES[number]));
}

export function isPlatformUser(user: AuthenticatedUser) {
  return user.roles.some((role) => role.code === "CITIS_SUPER_ADMIN" || role.code === "CITIS_PLATFORM_SUPPORT");
}

export function canAccessScope(user: AuthenticatedUser, institutionId: string, campusId?: string | null) {
  if (isLmsAdministrator(user)) return true;
  return user.scopes.some((scope) => (
    scope.institutionId === institutionId
    && (scope.campusId === null || campusId == null || scope.campusId === campusId)
  ));
}

export function assertScope(user: AuthenticatedUser, institutionId: string, campusId?: string | null): void {
  if (!canAccessScope(user, institutionId, campusId)) {
    throw new ForbiddenException("You are not authorized for this institution or campus.");
  }
}

export function assertScopeForRead(user: AuthenticatedUser, institutionId: string, campusId?: string | null): void {
  if (!canAccessScope(user, institutionId, campusId)) {
    throw new NotFoundException("The requested resource was not found.");
  }
}

export function filterScopedRows<T extends Record<string, unknown>>(
  user: AuthenticatedUser,
  rows: T[],
  institutionKey = "institution_id",
  campusKey = "campus_id",
) {
  if (isLmsAdministrator(user)) return rows;
  return rows.filter((row) => {
    const institutionId = row[institutionKey];
    return typeof institutionId === "string"
      && canAccessScope(user, institutionId, (row[campusKey] as string | null | undefined) ?? null);
  });
}