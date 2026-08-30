export type PermissionAction =
  | "VIEW"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "EXPORT"
  | "PUBLISH"
  | "ARCHIVE";

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta?: { requestId?: string; pagination?: Record<string, number> };
}

export interface ApiErrorEnvelope {
  success: false;
  error: { code: string; message: string; details?: unknown };
  meta?: { requestId?: string };
}