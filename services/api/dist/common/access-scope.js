"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlatformUser = isPlatformUser;
exports.canAccessScope = canAccessScope;
exports.assertScope = assertScope;
exports.assertScopeForRead = assertScopeForRead;
exports.filterScopedRows = filterScopedRows;
const common_1 = require("@nestjs/common");
function isPlatformUser(user) {
    return user.roles.some((role) => role.code === "CITIS_SUPER_ADMIN");
}
function canAccessScope(user, institutionId, campusId) {
    if (isPlatformUser(user))
        return true;
    return user.scopes.some((scope) => (scope.institutionId === institutionId
        && (scope.campusId === null || campusId == null || scope.campusId === campusId)));
}
function assertScope(user, institutionId, campusId) {
    if (!canAccessScope(user, institutionId, campusId)) {
        throw new common_1.ForbiddenException("You are not authorized for this institution or campus.");
    }
}
function assertScopeForRead(user, institutionId, campusId) {
    if (!canAccessScope(user, institutionId, campusId)) {
        throw new common_1.NotFoundException("The requested resource was not found.");
    }
}
function filterScopedRows(user, rows, institutionKey = "institution_id", campusKey = "campus_id") {
    if (isPlatformUser(user))
        return rows;
    return rows.filter((row) => {
        const institutionId = row[institutionKey];
        return typeof institutionId === "string"
            && canAccessScope(user, institutionId, row[campusKey] ?? null);
    });
}
//# sourceMappingURL=access-scope.js.map