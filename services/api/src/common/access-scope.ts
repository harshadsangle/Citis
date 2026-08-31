import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser } from "./request-context";

export interface AccessScope {
  institutionId: string;
  campusId: string | null;
}

export function isPlatformUser(user: AuthenticatedUser) {
  return user.roles.some((role) => role.code === "CITIS_SUPER_ADMIN");
}

export function canAccessScope(user: AuthenticatedUser, institutionId: string, campusId?: string | null) {
  if (isPlatformUser(user)) return true;
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
  if (isPlatformUser(user)) return rows;
  return rows.filter((row) => {
    const institutionId = row[institutionKey];
    return typeof institutionId === "string"
      && canAccessScope(user, institutionId, (row[campusKey] as string | null | undefined) ?? null);
  });
}