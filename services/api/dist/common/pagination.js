"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationFrom = paginationFrom;
exports.paginationMeta = paginationMeta;
const common_1 = require("@nestjs/common");
function paginationFrom(request) {
    const page = Number(request.query.page ?? 1);
    const pageSize = Number(request.query.pageSize ?? 25);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
        throw new common_1.BadRequestException({ error: "INVALID_PAGINATION", message: "page must be >= 1 and pageSize must be between 1 and 100." });
    }
    return { page, pageSize, offset: (page - 1) * pageSize };
}
function paginationMeta(page, pageSize, total) {
    return { page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}
//# sourceMappingURL=pagination.js.map