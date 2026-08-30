"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.paginatedResponse = paginatedResponse;
function successResponse(data, request, meta = {}) {
    const requestId = request?.context?.requestId;
    return {
        success: true,
        data,
        meta: { ...(requestId ? { requestId } : {}), ...meta },
    };
}
function paginatedResponse(data, pagination, request) {
    return successResponse(data, request, { pagination });
}
//# sourceMappingURL=response.js.map