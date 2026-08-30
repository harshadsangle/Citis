"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let ApiExceptionFilter = class ApiExceptionFilter {
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        const request = host.switchToHttp().getRequest();
        const status = exception instanceof common_1.HttpException ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception instanceof common_1.HttpException ? exception.getResponse() : undefined;
        const payload = typeof exceptionResponse === "string" ? { message: exceptionResponse } : exceptionResponse;
        const message = typeof payload === "object" && payload && "message" in payload
            ? Array.isArray(payload.message) ? payload.message.join(", ") : String(payload.message)
            : "An unexpected error occurred.";
        response.status(status).json({
            success: false,
            error: {
                code: typeof payload === "object" && payload && "error" in payload ? String(payload.error) : `HTTP_${status}`,
                message,
                details: typeof payload === "object" && payload && "details" in payload ? payload.details : undefined,
            },
            meta: { requestId: request.context?.requestId },
        });
    }
};
exports.ApiExceptionFilter = ApiExceptionFilter;
exports.ApiExceptionFilter = ApiExceptionFilter = __decorate([
    (0, common_1.Catch)()
], ApiExceptionFilter);
//# sourceMappingURL=errors.filter.js.map