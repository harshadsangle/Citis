"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermission = exports.REQUIRED_PERMISSION = void 0;
const common_1 = require("@nestjs/common");
exports.REQUIRED_PERMISSION = "required_permission";
const RequirePermission = (permission) => (0, common_1.SetMetadata)(exports.REQUIRED_PERMISSION, permission);
exports.RequirePermission = RequirePermission;
//# sourceMappingURL=permission.decorator.js.map