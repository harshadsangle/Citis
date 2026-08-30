import type { Request } from "express";
import type { ContextRequest } from "./request-context";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: Record<string, unknown>;
}

export function successResponse<T>(data: T, request?: Request, meta: Record<string, unknown> = {}): ApiSuccess<T> {
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
): ApiSuccess<T[]> {
  return successResponse(data, request, { pagination });
}