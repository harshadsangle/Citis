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
exports.AuthService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const database_service_1 = require("../../database/database.service");
const PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const SESSION_DAYS = 7;
function hashToken(token) {
    return (0, node_crypto_1.createHash)("sha256").update(token).digest("hex");
}
function toPrincipal(row) {
    return {
        id: row.id,
        tenantId: row.tenant_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        roles: row.roles ?? [],
        permissions: row.permissions ?? [],
        scopes: row.scopes ?? [],
    };
}
let AuthService = class AuthService {
    db;
    constructor(db) {
        this.db = db;
    }
    async login(input, metadata) {
        const result = await this.db.query(`SELECT u.id, u.tenant_id, u.email, u.first_name, u.last_name, u.password_hash,
              u.status, t.slug AS tenant_slug
       FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE lower(u.email) = lower($1)
         AND ($2::text IS NULL OR t.slug = $2)
         AND t.status = 'ACTIVE'
       ORDER BY u.created_at
       LIMIT 2`, [input.email.trim(), input.tenantSlug?.trim() || null]);
        const user = result.rows.length === 1 ? result.rows[0] : undefined;
        if (!user || user.status !== "ACTIVE" || !user.password_hash || !(await bcrypt.compare(input.password, user.password_hash))) {
            throw new common_1.UnauthorizedException("Invalid email or password.");
        }
        await this.db.query("UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1 AND tenant_id = $2", [
            user.id,
            user.tenant_id,
        ]);
        return this.startSession(user.id, metadata);
    }
    async startSession(userId, metadata) {
        const token = (0, node_crypto_1.randomBytes)(32).toString("base64url");
        const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
        await this.db.query(`INSERT INTO auth_sessions (user_id, token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`, [userId, hashToken(token), expiresAt, metadata.ipAddress ?? null, metadata.userAgent ?? null]);
        return { token, expiresAt };
    }
    async resolveSession(token) {
        const result = await this.db.query(`SELECT u.id, u.tenant_id, u.email, u.first_name, u.last_name,
        COALESCE((
          SELECT json_agg(json_build_object('code', r.code, 'name', r.name))
          FROM user_roles ur JOIN roles r ON r.id = ur.role_id
          WHERE ur.user_id = u.id AND ur.tenant_id = u.tenant_id AND r.status = 'ACTIVE'
        ), '[]'::json) AS roles,
        COALESCE((
          SELECT json_agg(DISTINCT p.code)
          FROM user_roles ur
          JOIN roles r ON r.id = ur.role_id
          JOIN role_permissions rp ON rp.role_id = r.id
          JOIN permissions p ON p.id = rp.permission_id
          WHERE ur.user_id = u.id AND ur.tenant_id = u.tenant_id AND r.status = 'ACTIVE'
         ), '[]'::json) AS permissions,
         COALESCE((
           SELECT jsonb_agg(DISTINCT jsonb_build_object(
             'institutionId', ur.institution_id,
             'campusId', ur.campus_id
           ))
           FROM user_roles ur
           JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
           WHERE ur.user_id = u.id
             AND ur.tenant_id = u.tenant_id
             AND ur.institution_id IS NOT NULL
             AND r.status = 'ACTIVE'
         ), '[]'::jsonb) AS scopes
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
       JOIN tenants t ON t.id = u.tenant_id
       WHERE s.token_hash = $1
         AND s.revoked_at IS NULL
         AND s.expires_at > now()
         AND u.status = 'ACTIVE'
         AND t.status = 'ACTIVE'
       LIMIT 1`, [hashToken(token)]);
        return result.rows[0] ? toPrincipal(result.rows[0]) : null;
    }
    async logout(token) {
        await this.db.query("UPDATE auth_sessions SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL", [
            hashToken(token),
        ]);
    }
    async requestOtp(input) {
        const tenant = await this.db.query("SELECT id FROM tenants WHERE slug = $1 AND status = 'ACTIVE'", [
            input.tenantSlug.trim(),
        ]);
        if (!tenant.rows[0])
            throw new common_1.UnauthorizedException("The requested institution is not available.");
        const code = (0, node_crypto_1.randomBytes)(3).toString("hex").slice(0, 6);
        await this.db.query(`INSERT INTO auth_challenges (tenant_id, mobile, purpose, code_hash, expires_at)
       VALUES ($1, $2, 'LOGIN', $3, now() + interval '10 minutes')`, [tenant.rows[0].id, input.mobile.trim(), hashToken(code)]);
        return { accepted: true, expiresInSeconds: 600 };
    }
    async verifyOtp(input, metadata) {
        const result = await this.db.query(`SELECT c.id, u.id AS user_id
       FROM auth_challenges c
       JOIN users u ON u.tenant_id = c.tenant_id AND u.mobile = c.mobile
       WHERE c.mobile = $1 AND c.code_hash = $2 AND c.purpose = 'LOGIN'
         AND c.consumed_at IS NULL AND c.expires_at > now() AND u.status = 'ACTIVE'
       ORDER BY c.created_at DESC LIMIT 1`, [input.mobile.trim(), hashToken(input.code)]);
        if (!result.rows[0])
            throw new common_1.UnauthorizedException("Invalid or expired verification code.");
        await this.db.query("UPDATE auth_challenges SET consumed_at = now() WHERE id = $1", [result.rows[0].id]);
        return this.startSession(result.rows[0].user_id, metadata);
    }
    providerStatus(provider) {
        const envKey = `${provider.toUpperCase()}_CLIENT_ID`;
        return {
            provider,
            configured: Boolean(process.env[envKey]),
            status: process.env[envKey] ? "READY_FOR_ADAPTER" : "CONFIGURATION_REQUIRED",
        };
    }
    static platformTenantId() {
        return PLATFORM_TENANT_ID;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map