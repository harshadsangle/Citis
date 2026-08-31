import { BadRequestException } from "@nestjs/common";
import type { Request } from "express";

export function paginationFrom(request: Request) {
  const page = Number(request.query.page ?? 1);
  const pageSize = Number(request.query.pageSize ?? 25);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new BadRequestException({ error: "INVALID_PAGINATION", message: "page must be >= 1 and pageSize must be between 1 and 100." });
  }
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export function paginationMeta(page: number, pageSize: number, total: number) {
  return { page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}