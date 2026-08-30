import type { Request } from "express";
export declare function paginationFrom(request: Request): {
    page: number;
    pageSize: number;
    offset: number;
};
export declare function paginationMeta(page: number, pageSize: number, total: number): {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};
