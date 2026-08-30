import type { Request } from "express";
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
export declare function successResponse<T>(data: T, request?: Request, meta?: Record<string, unknown>): ApiSuccess<T>;
export declare function paginatedResponse<T>(data: T[], pagination: PaginationMeta, request?: Request): ApiSuccess<T[]>;
