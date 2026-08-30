"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("./response");
describe("API response envelopes", () => {
    it("includes request tracing metadata for successful responses", () => {
        const response = (0, response_1.successResponse)({ ready: true }, { context: { requestId: "request-1" } });
        expect(response).toEqual({
            success: true,
            data: { ready: true },
            meta: { requestId: "request-1" },
        });
    });
    it("keeps pagination under meta", () => {
        const response = (0, response_1.paginatedResponse)(["a"], { page: 1, pageSize: 25, total: 1, totalPages: 1 });
        expect(response.meta?.pagination).toEqual({ page: 1, pageSize: 25, total: 1, totalPages: 1 });
    });
});
//# sourceMappingURL=response.spec.js.map