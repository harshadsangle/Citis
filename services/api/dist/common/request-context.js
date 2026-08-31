"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContextMiddleware = requestContextMiddleware;
const node_crypto_1 = require("node:crypto");
function requestContextMiddleware(request, response, next) {
    const requestId = request.header("x-request-id")?.trim() || (0, node_crypto_1.randomUUID)();
    const contextRequest = request;
    contextRequest.context = {
        requestId,
        ipAddress: request.ip,
        userAgent: request.header("user-agent") || undefined,
    };
    response.setHeader("X-Request-ID", requestId);
    next();
}
//# sourceMappingURL=request-context.js.map