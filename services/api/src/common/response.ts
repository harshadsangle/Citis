import type { Request } from "express";
import type { ContextRequest } from "./request-context";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function successResponse<T>(data: T, request?: Request, meta: Record<string, unknown> = {}) {
  const requestId = (request as ContextRequest | undefined)?.context?.requestId;
  return {
    success: true,
    data,
    meta: { ...(requestId ? { requestId } : {}), ...meta },
  };
}

export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  request?: Request,
) {
  return successResponse(data, request, { pagination });
}