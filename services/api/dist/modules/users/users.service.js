"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const audit_service_1 = require("../../common/audit.service");
const access_scope_1 = require("../../common/access-scope");
const pagination_1 = require("../../common/pagination");
const database_service_1 = require("../../database/database.service");
let UsersService = class UsersService {
    db;
    audit;
    constructor(db, audit) {
        this.db = db;
        this.audit = audit;
    }
    platform(user) {
        return (0, access_scope_1.isPlatformUser)(user);
    }
    async list(user, page, pageSize, offset, tenantId) {
        const scope = this.platform(user) ? tenantId : user.tenantId;
        const values = [];
        const where = scope
            ? `WHERE u.tenant_id = $1${this.userScopePredicate(user, "u", 2)}`
            : "";
        if (scope)
            values.push(scope);
        if (!this.platform(user))
            values.push(user.id);
        const [rows, total] = await Promise.all([
            this.db.query(`SELECT u.id, u.tenant_id, u.email, u.mobile, u.first_name, u.last_name, u.profile_image, u.status, u.last_login_at, u.created_at, u.updated_at
        FROM users u ${where} ORDER BY u.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, pageSize, offset]),
            this.db.query(`SELECT count(*)::text AS count FROM users u ${where}`, values),
        ]);
        return { data: rows.rows, meta: (0, pagination_1.paginationMeta)(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
    }
    async get(id, user) {
        const result = await this.db.query(`SELECT u.id, u.tenant_id, u.email, u.mobile, u.first_name, u.last_name, u.profile_image, u.status, u.last_login_at, u.created_at, u.updated_at
       FROM users u WHERE u.id = $1 AND ($2::uuid IS NULL OR u.tenant_id = $2)${this.userScopePredicate(user, "u", 3)}`, this.platform(user) ? [id, null] : [id, user.tenantId, user.id]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("User not found.");
        return result.rows[0];
    }
    async create(input, request) {
        const actor = request.context.user;
        const tenantId = this.platform(actor) ? input.tenantId : actor.tenantId;
        if (!tenantId)
            throw new common_1.NotFoundException("A tenant scope is required.");
        const passwordHash = input.password ? await bcrypt.hash(input.password, 12) : null;
        const result = await this.db.query(`INSERT INTO users (tenant_id, email, mobile, password_hash, first_name, last_name, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       RETURNING id, tenant_id, email, mobile, first_name, last_name, profile_image, status, last_login_at, created_at, updated_at`, [tenantId, input.email?.trim().toLowerCase() || null, input.mobile?.trim() || null, passwordHash, input.firstName.trim(), input.lastName?.trim() || "", actor.id]);
        const user = result.rows[0];
        await this.audit.record({ tenantId, actorUserId: actor.id, requestId: request.context.requestId, module: "identity", resource: "user", resourceId: user.id, action: "CREATE", newValue: user, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
        return user;
    }
    async update(id, input, request) {
        const actor = request.context.user;
        const before = await this.get(id, actor);
        const result = await this.db.query(`UPDATE users SET first_name = COALESCE($2, first_name), last_name = COALESCE($3, last_name),
        mobile = COALESCE($4, mobile), status = COALESCE($5, status), updated_by = $6, updated_at = now()
       WHERE id = $1 AND ($7::uuid IS NULL OR tenant_id = $7)
       RETURNING id, tenant_id, email, mobile, first_name, last_name, profile_image, status, last_login_at, created_at, updated_at`, [id, input.firstName?.trim() || null, input.lastName?.trim() || null, input.mobile?.trim() || null, input.status ?? null, actor.id, this.platform(actor) ? null : actor.tenantId]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("User not found.");
        const user = result.rows[0];
        await this.audit.record({ tenantId: user.tenant_id, actorUserId: actor.id, requestId: request.context.requestId, module: "identity", resource: "user", resourceId: id, action: "UPDATE", previousValue: before, newValue: user, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
        return user;
    }
    async assignRole(id, input, request) {
        const actor = request.context.user;
        const userResult = await this.db.query("SELECT id, tenant_id FROM users WHERE id = $1 AND tenant_id = $2", [id, this.platform(actor) ? null : actor.tenantId]);
        if (!userResult.rows[0])
            throw new common_1.NotFoundException("User not found.");
        const existingScopes = await this.db.query("SELECT institution_id, campus_id FROM user_roles WHERE user_id = $1 AND tenant_id = $2", [id, userResult.rows[0].tenant_id]);
        if (!this.platform(actor) && existingScopes.rows.length && !existingScopes.rows.some((scope) => (scope.institution_id !== null
            && actor.scopes.some((allowed) => allowed.institutionId === scope.institution_id
                && (allowed.campusId === null || scope.campus_id === null || allowed.campusId === scope.campus_id))))) {
            throw new common_1.NotFoundException("User not found.");
        }
        const user = userResult.rows[0];
        const role = await this.db.query("SELECT id, code FROM roles WHERE id = $1 AND tenant_id = $2 AND status = 'ACTIVE'", [input.roleId, user.tenant_id]);
        if (!role.rows[0])
            throw new common_1.NotFoundException("Role not found in the user tenant.");
        const platformRole = role.rows[0].code === "CITIS_SUPER_ADMIN" || role.rows[0].code === "CITIS_PLATFORM_SUPPORT";
        if (platformRole && (input.institutionId || input.campusId)) {
            throw new common_1.BadRequestException("Platform roles cannot be assigned to an institution or campus.");
        }
        if (!platformRole && !input.institutionId) {
            throw new common_1.BadRequestException("An institution is required for a scoped role.");
        }
        if (input.campusId && !input.institutionId) {
            throw new common_1.BadRequestException("A campus must be assigned with its institution.");
        }
        if (input.institutionId) {
            const scope = await this.db.query(`SELECT i.id, c.id AS campus_id
         FROM institutions i
         LEFT JOIN campuses c ON c.id = $3 AND c.tenant_id = i.tenant_id AND c.institution_id = i.id
         WHERE i.id = $1 AND i.tenant_id = $2 AND i.status <> 'ARCHIVED'
           AND ($3::uuid IS NULL OR c.id IS NOT NULL)`, [input.institutionId, user.tenant_id, input.campusId ?? null]);
            if (!scope.rows[0] || (input.campusId && scope.rows[0].campus_id !== input.campusId)) {
                throw new common_1.NotFoundException("Institution or campus not found in the user tenant.");
            }
            if (!this.platform(actor))
                (0, access_scope_1.assertScope)(actor, input.institutionId, input.campusId ?? null);
        }
        const result = await this.db.query(`INSERT INTO user_roles (tenant_id, user_id, role_id, institution_id, campus_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, role_id, institution_id, campus_id) DO NOTHING
       RETURNING id, tenant_id, user_id, role_id, institution_id, campus_id`, [user.tenant_id, id, input.roleId, input.institutionId ?? null, input.campusId ?? null]);
        const assignment = result.rows[0] ?? { userId: id, roleId: input.roleId, institutionId: input.institutionId ?? null, campusId: input.campusId ?? null };
        await this.audit.record({ tenantId: user.tenant_id, actorUserId: actor.id, requestId: request.context.requestId, module: "identity", resource: "user_role", resourceId: id, action: "CREATE", newValue: assignment, ipAddress: request.context.ipAddress, deviceContext: { userAgent: request.context.userAgent } });
        return assignment;
    }
    userScopePredicate(user, alias, actorParameter) {
        if (this.platform(user))
            return "";
        return ` AND EXISTS (
      SELECT 1
      FROM user_roles target_scope
      JOIN user_roles actor_scope
        ON actor_scope.user_id = $${actorParameter}
       AND actor_scope.tenant_id = target_scope.tenant_id
       AND actor_scope.institution_id = target_scope.institution_id
       AND (actor_scope.campus_id IS NULL OR target_scope.campus_id IS NULL OR actor_scope.campus_id = target_scope.campus_id)
      JOIN roles target_role ON target_role.id = target_scope.role_id AND target_role.tenant_id = target_scope.tenant_id
      WHERE target_scope.user_id = ${alias}.id
        AND target_scope.tenant_id = ${alias}.tenant_id
        AND target_role.status = 'ACTIVE'
    )`;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map