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
const RESET_TOKEN_MINUTES = 60;
const VERIFICATION_TOKEN_HOURS = 24;
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
        const requestId = metadata.requestId || "unknown";
        let stage = "db-query";
        const diagnostic = (message) => {
            console.log(`[TEMP_AUTH_DIAGNOSTIC] AuthService.login requestId=${requestId} ${message}`);
        };
        const diagnosticError = (error) => {
            const errorName = error instanceof Error ? error.name : typeof error;
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorCode = typeof error === "object" && error && "code" in error ? String(error.code) : "none";
            console.error(`[TEMP_AUTH_DIAGNOSTIC] AuthService.login failed requestId=${requestId} stage=${stage} errorName=${errorName} errorCode=${errorCode} errorMessage=${errorMessage}`);
        };
        diagnostic("stage=db-query status=started");
        try {
            const result = await this.db.query(`SELECT u.id, u.tenant_id, u.email, u.first_name, u.last_name, u.password_hash,
                u.status, t.slug AS tenant_slug
         FROM users u
         JOIN tenants t ON t.id = u.tenant_id
         WHERE lower(u.email) = lower($1)
           AND ($2::text IS NULL OR t.slug = $2)
           AND t.status = 'ACTIVE'
         ORDER BY u.created_at
         LIMIT 2`, [input.email.trim(), input.tenantSlug?.trim() || null]);
            diagnostic(`stage=db-query status=succeeded rowCount=${result.rows.length}`);
            stage = "user-lookup";
            const user = result.rows.length === 1 ? result.rows[0] : undefined;
            diagnostic(`stage=user-lookup status=${user ? "found" : "not-found"} rowCount=${result.rows.length} userStatus=${user?.status || "none"} passwordHashPresent=${Boolean(user?.password_hash)}`);
            if (!user || user.status !== "ACTIVE" || !user.password_hash) {
                diagnostic("stage=user-lookup outcome=rejected reason=missing-or-inactive-user");
                throw new common_1.UnauthorizedException("Invalid email or password.");
            }
            stage = "password-verification";
            diagnostic("stage=password-verification status=started");
            const passwordMatches = await bcrypt.compare(input.password, user.password_hash);
            diagnostic(`stage=password-verification status=succeeded matched=${passwordMatches}`);
            if (!passwordMatches) {
                diagnostic("stage=password-verification outcome=rejected reason=password-mismatch");
                throw new common_1.UnauthorizedException("Invalid email or password.");
            }
            stage = "last-login-update";
            diagnostic("stage=last-login-update status=started");
            await this.db.query("UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1 AND tenant_id = $2", [
                user.id,
                user.tenant_id,
            ]);
            diagnostic("stage=last-login-update status=succeeded");
            stage = "role-lookup";
            diagnostic("stage=role-lookup status=not-executed reason=roles-resolve-during-auth-me");
            stage = "session-creation";
            diagnostic("stage=session-creation status=started");
            const session = await this.startSession(user.id, metadata);
            diagnostic("stage=session-creation status=succeeded");
            return session;
        }
        catch (error) {
            diagnosticError(error);
            throw error;
        }
    }
    async register(input, metadata) {
        const roleCode = {
            learner: "STUDENT",
            instructor: "TEACHER",
            admin: "INSTITUTION_ADMINISTRATOR",
        }[input.role];
        const tenant = await this.db.query("SELECT id FROM tenants WHERE slug = $1 AND status = 'ACTIVE' LIMIT 1", [input.tenantSlug?.trim() || "citis-platform"]);
        if (!tenant.rows[0])
            throw new common_1.BadRequestException("The requested institution is not available.");
        const email = input.email.trim().toLowerCase();
        const passwordHash = await bcrypt.hash(input.password, 12);
        const verificationToken = (0, node_crypto_1.randomBytes)(32).toString("base64url");
        const tokenHash = hashToken(verificationToken);
        await this.db.transaction(async (client) => {
            const existing = await client.query("SELECT id FROM users WHERE tenant_id = $1 AND lower(email) = lower($2) LIMIT 1", [tenant.rows[0].id, email]);
            if (existing.rows[0])
                throw new common_1.ConflictException("An account already exists for that email.");
            const user = await client.query(`INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, status)
         VALUES ($1, $2, $3, $4, $5, 'PENDING')
         RETURNING id`, [tenant.rows[0].id, email, passwordHash, input.firstName.trim(), input.lastName.trim()]);
            const role = await client.query("SELECT id FROM roles WHERE tenant_id = $1 AND code = $2 AND status = 'ACTIVE' LIMIT 1", [tenant.rows[0].id, roleCode]);
            if (!role.rows[0])
                throw new common_1.BadRequestException("That account role is not available.");
            await client.query(`INSERT INTO user_roles (tenant_id, user_id, role_id)
         VALUES ($1, $2, $3)`, [tenant.rows[0].id, user.rows[0].id, role.rows[0].id]);
            await client.query(`INSERT INTO auth_email_verification_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, now() + interval '${VERIFICATION_TOKEN_HOURS} hours')`, [user.rows[0].id, tokenHash]);
        });
        return {
            accepted: true,
            status: "PENDING",
            role: input.role,
            requiresApproval: input.role !== "learner",
            ...(process.env.NODE_ENV !== "production" ? { developmentVerificationToken: verificationToken } : {}),
        };
    }
    async requestPasswordReset(input, metadata) {
        const email = input.email.trim().toLowerCase();
        const result = await this.db.query(`SELECT u.id
       FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE lower(u.email) = lower($1)
         AND ($2::text IS NULL OR t.slug = $2)
         AND t.status = 'ACTIVE'
         AND u.status <> 'ARCHIVED'
       ORDER BY u.created_at
       LIMIT 1`, [email, input.tenantSlug?.trim() || null]);
        if (!result.rows[0])
            return { accepted: true };
        const rawToken = (0, node_crypto_1.randomBytes)(32).toString("base64url");
        await this.db.transaction(async (client) => {
            await client.query("UPDATE auth_password_reset_tokens SET consumed_at = now() WHERE user_id = $1 AND consumed_at IS NULL", [result.rows[0].id]);
            await client.query(`INSERT INTO auth_password_reset_tokens
           (user_id, token_hash, expires_at, requested_ip, requested_user_agent)
         VALUES ($1, $2, now() + interval '${RESET_TOKEN_MINUTES} minutes', $3, $4)`, [result.rows[0].id, hashToken(rawToken), metadata.ipAddress ?? null, metadata.userAgent ?? null]);
        });
        return {
            accepted: true,
            ...(process.env.NODE_ENV !== "production" ? { developmentResetToken: rawToken } : {}),
        };
    }
    async resetPassword(token, input) {
        const passwordHash = await bcrypt.hash(input.password, 12);
        return this.db.transaction(async (client) => {
            const result = await client.query(`SELECT t.id, t.user_id
         FROM auth_password_reset_tokens t
         JOIN users u ON u.id = t.user_id
         WHERE t.token_hash = $1 AND t.consumed_at IS NULL AND t.expires_at > now()
           AND u.status <> 'ARCHIVED'
         FOR UPDATE`, [hashToken(token)]);
            if (!result.rows[0])
                throw new common_1.BadRequestException("This password reset link is invalid or has expired.");
            await client.query("UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2 AND status <> 'ARCHIVED'", [passwordHash, result.rows[0].user_id]);
            await client.query("UPDATE auth_password_reset_tokens SET consumed_at = now() WHERE id = $1", [result.rows[0].id]);
            await client.query("UPDATE auth_sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [result.rows[0].user_id]);
            return { reset: true };
        });
    }
    async verifyEmail(token) {
        return this.db.transaction(async (client) => {
            const result = await client.query(`SELECT v.id, v.user_id, r.code AS role_code
         FROM auth_email_verification_tokens v
         JOIN users u ON u.id = v.user_id
         JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
         JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
         WHERE v.token_hash = $1
           AND v.consumed_at IS NULL
           AND v.expires_at > now()
           AND u.status <> 'ARCHIVED'
         LIMIT 1
         FOR UPDATE OF v`, [hashToken(token)]);
            if (!result.rows[0])
                throw new common_1.BadRequestException("This verification link is invalid or has expired.");
            await client.query("UPDATE auth_email_verification_tokens SET consumed_at = now() WHERE id = $1", [result.rows[0].id]);
            const activeAfterVerification = result.rows[0].role_code === "STUDENT";
            await client.query(`UPDATE users
         SET email_verified_at = now(),
             status = CASE WHEN status = 'PENDING' AND $1 THEN 'ACTIVE' ELSE status END,
             updated_at = now()
         WHERE id = $2`, [activeAfterVerification, result.rows[0].user_id]);
            return {
                verified: true,
                status: activeAfterVerification ? "ACTIVE" : "PENDING",
                requiresApproval: !activeAfterVerification,
            };
        });
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