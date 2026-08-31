"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const response_1 = require("./response");
(0, node_test_1.default)("API response includes request tracing metadata", () => {
    const response = (0, response_1.successResponse)({ ready: true }, { context: { requestId: "request-1" } });
    strict_1.default.deepEqual(response, {
        success: true,
        data: { ready: true },
        meta: { requestId: "request-1" },
    });
});
(0, node_test_1.default)("API response keeps pagination under meta", () => {
    const response = (0, response_1.paginatedResponse)(["a"], { page: 1, pageSize: 25, total: 1, totalPages: 1 });
    strict_1.default.deepEqual(response.meta.pagination, { page: 1, pageSize: 25, total: 1, totalPages: 1 });
});
//# sourceMappingURL=response.spec.js.map