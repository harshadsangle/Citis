import type { Request } from "express";
export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}
export declare function successResponse<T>(data: T, request?: Request, meta?: Record<string, unknown>): {
    success: boolean;
    data: T;
    meta: {
        requestId?: string | undefined;
    };
};
export declare function paginatedResponse<T>(data: T[], pagination: PaginationMeta, request?: Request): {
    success: boolean;
    data: T[];
    meta: {
        requestId?: string | undefined;
    };
};
