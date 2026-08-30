import { paginatedResponse, successResponse } from "./response";

describe("API response envelopes", () => {
  it("includes request tracing metadata for successful responses", () => {
    const response = successResponse({ ready: true }, { context: { requestId: "request-1" } } as never);
    expect(response).toEqual({
      success: true,
      data: { ready: true },
      meta: { requestId: "request-1" },
    });
  });

  it("keeps pagination under meta", () => {
    const response = paginatedResponse(["a"], { page: 1, pageSize: 25, total: 1, totalPages: 1 });
    expect(response.meta?.pagination).toEqual({ page: 1, pageSize: 25, total: 1, totalPages: 1 });
  });
});