import assert from "node:assert/strict";
import test from "node:test";
import { paginatedResponse, successResponse } from "./response";

test("API response includes request tracing metadata", () => {
    const response = successResponse({ ready: true }, { context: { requestId: "request-1" } } as never);
    assert.deepEqual(response, {
      success: true,
      data: { ready: true },
      meta: { requestId: "request-1" },
    });
});

test("API response keeps pagination under meta", () => {
    const response = paginatedResponse(["a"], { page: 1, pageSize: 25, total: 1, totalPages: 1 });
    assert.deepEqual(response.meta.pagination, { page: 1, pageSize: 25, total: 1, totalPages: 1 });
});