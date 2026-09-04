import { createHash, randomBytes } from "node:crypto";
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { DatabaseService } from "../../database/database.service";
import type { AuthenticatedUser } from "../../common/request-context";
import type { AccessScope } from "../../common/access-scope";
import type {
  ForgotPasswordDto,
  LoginDto,
  OtpRequestDto,
  OtpVerifyDto,
  RegisterDto,
  ResetPasswordDto,
} from "./auth.dto";

const PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const SESSION_DAYS = 7;
const RESET_TOKEN_MINUTES = 60;
const VERIFICATION_TOKEN_HOURS = 24;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toPrincipal(row: {
  id: string;
  tenant_id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  roles: Array<{ code: string; name: string }> | null;
  permissions: string[] | null;
  scopes: AccessScope[] | null;
}): AuthenticatedUser {
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

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
  ) {}

  async login(input: LoginDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const result = await this.db.query<{
      id: string;
      tenant_id: string;
      email: string | null;
      first_name: string;
      last_name: string;
      password_hash: string | null;
      status: string;
      tenant_slug: string;
    }>(
      `SELECT u.id, u.tenant_id, u.email, u.first_name, u.last_name, u.password_hash,
              u.status, t.slug AS tenant_slug
       FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE lower(u.email) = lower($1)
         AND ($2::text IS NULL OR t.slug = $2)
         AND t.status = 'ACTIVE'
       ORDER BY u.created_at
       LIMIT 2`,
      [input.email.trim(), input.tenantSlug?.trim() || null],
    );
    const user = result.rows.length === 1 ? result.rows[0] : undefined;
    if (!user || user.status !== "ACTIVE" || !user.password_hash || !(await bcrypt.compare(input.password, user.password_hash))) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    await this.db.query("UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1 AND tenant_id = $2", [
      user.id,
      user.tenant_id,
    ]);
    return this.startSession(user.id, metadata);
  }

  async register(input: RegisterDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const roleCode = {
      learner: "STUDENT",
      instructor: "TEACHER",
      admin: "INSTITUTION_ADMINISTRATOR",
    }[input.role];
    const tenant = await this.db.query<{ id: string }>(
      "SELECT id FROM tenants WHERE slug = $1 AND status = 'ACTIVE' LIMIT 1",
      [input.tenantSlug?.trim() || "citis-platform"],
    );
    if (!tenant.rows[0]) throw new BadRequestException("The requested institution is not available.");

    const email = input.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(input.password, 12);
    const verificationToken = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(verificationToken);
    await this.db.transaction(async (client) => {
      const existing = await client.query<{ id: string }>(
        "SELECT id FROM users WHERE tenant_id = $1 AND lower(email) = lower($2) LIMIT 1",
        [tenant.rows[0].id, email],
      );
      if (existing.rows[0]) throw new ConflictException("An account already exists for that email.");

      const user = await client.query<{ id: string }>(
        `INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, status)
         VALUES ($1, $2, $3, $4, $5, 'PENDING')
         RETURNING id`,
        [tenant.rows[0].id, email, passwordHash, input.firstName.trim(), input.lastName.trim()],
      );
      const role = await client.query<{ id: string }>(
        "SELECT id FROM roles WHERE tenant_id = $1 AND code = $2 AND status = 'ACTIVE' LIMIT 1",
        [tenant.rows[0].id, roleCode],
      );
      if (!role.rows[0]) throw new BadRequestException("That account role is not available.");

      await client.query(
        `INSERT INTO user_roles (tenant_id, user_id, role_id)
         VALUES ($1, $2, $3)`,
        [tenant.rows[0].id, user.rows[0].id, role.rows[0].id],
      );
      await client.query(
        `INSERT INTO auth_email_verification_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, now() + interval '${VERIFICATION_TOKEN_HOURS} hours')`,
        [user.rows[0].id, tokenHash],
      );
    });

    return {
      accepted: true,
      status: "PENDING",
      role: input.role,
      requiresApproval: input.role !== "learner",
      ...(process.env.NODE_ENV !== "production" ? { developmentVerificationToken: verificationToken } : {}),
    };
  }

  async requestPasswordReset(input: ForgotPasswordDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const email = input.email.trim().toLowerCase();
    const result = await this.db.query<{ id: string }>(
      `SELECT u.id
       FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE lower(u.email) = lower($1)
         AND ($2::text IS NULL OR t.slug = $2)
         AND t.status = 'ACTIVE'
         AND u.status <> 'ARCHIVED'
       ORDER BY u.created_at
       LIMIT 1`,
      [email, input.tenantSlug?.trim() || null],
    );
    if (!result.rows[0]) return { accepted: true };

    const rawToken = randomBytes(32).toString("base64url");
    await this.db.transaction(async (client) => {
      await client.query(
        "UPDATE auth_password_reset_tokens SET consumed_at = now() WHERE user_id = $1 AND consumed_at IS NULL",
        [result.rows[0].id],
      );
      await client.query(
        `INSERT INTO auth_password_reset_tokens
           (user_id, token_hash, expires_at, requested_ip, requested_user_agent)
         VALUES ($1, $2, now() + interval '${RESET_TOKEN_MINUTES} minutes', $3, $4)`,
        [result.rows[0].id, hashToken(rawToken), metadata.ipAddress ?? null, metadata.userAgent ?? null],
      );
    });

    return {
      accepted: true,
      ...(process.env.NODE_ENV !== "production" ? { developmentResetToken: rawToken } : {}),
    };
  }

  async resetPassword(token: string, input: ResetPasswordDto) {
    const passwordHash = await bcrypt.hash(input.password, 12);
    return this.db.transaction(async (client) => {
      const result = await client.query<{ id: string; user_id: string }>(
        `SELECT t.id, t.user_id
         FROM auth_password_reset_tokens t
         JOIN users u ON u.id = t.user_id
         WHERE t.token_hash = $1 AND t.consumed_at IS NULL AND t.expires_at > now()
           AND u.status <> 'ARCHIVED'
         FOR UPDATE`,
        [hashToken(token)],
      );
      if (!result.rows[0]) throw new BadRequestException("This password reset link is invalid or has expired.");

      await client.query(
        "UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2 AND status <> 'ARCHIVED'",
        [passwordHash, result.rows[0].user_id],
      );
      await client.query(
        "UPDATE auth_password_reset_tokens SET consumed_at = now() WHERE id = $1",
        [result.rows[0].id],
      );
      await client.query(
        "UPDATE auth_sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL",
        [result.rows[0].user_id],
      );
      return { reset: true };
    });
  }

  async verifyEmail(token: string) {
    return this.db.transaction(async (client) => {
      const result = await client.query<{ id: string; user_id: string; role_code: string }>(
        `SELECT v.id, v.user_id, r.code AS role_code
         FROM auth_email_verification_tokens v
         JOIN users u ON u.id = v.user_id
         JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
         JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
         WHERE v.token_hash = $1
           AND v.consumed_at IS NULL
           AND v.expires_at > now()
           AND u.status <> 'ARCHIVED'
         LIMIT 1
         FOR UPDATE OF v`,
        [hashToken(token)],
      );
      if (!result.rows[0]) throw new BadRequestException("This verification link is invalid or has expired.");

      await client.query("UPDATE auth_email_verification_tokens SET consumed_at = now() WHERE id = $1", [result.rows[0].id]);
      const activeAfterVerification = result.rows[0].role_code === "STUDENT";
      await client.query(
        `UPDATE users
         SET email_verified_at = now(),
             status = CASE WHEN status = 'PENDING' AND $1 THEN 'ACTIVE' ELSE status END,
             updated_at = now()
         WHERE id = $2`,
        [activeAfterVerification, result.rows[0].user_id],
      );
      return {
        verified: true,
        status: activeAfterVerification ? "ACTIVE" : "PENDING",
        requiresApproval: !activeAfterVerification,
      };
    });
  }

  async startSession(userId: string, metadata: { ipAddress?: string; userAgent?: string }) {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    await this.db.query(
      `INSERT INTO auth_sessions (user_id, token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, hashToken(token), expiresAt, metadata.ipAddress ?? null, metadata.userAgent ?? null],
    );
    return { token, expiresAt };
  }

  async resolveSession(token: string): Promise<AuthenticatedUser | null> {
    const result = await this.db.query<{
      id: string;
      tenant_id: string;
      email: string | null;
      first_name: string;
      last_name: string;
      roles: Array<{ code: string; name: string }> | null;
      permissions: string[] | null;
      scopes: AccessScope[] | null;
    }>(
      `SELECT u.id, u.tenant_id, u.email, u.first_name, u.last_name,
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
       LIMIT 1`,
      [hashToken(token)],
    );
    return result.rows[0] ? toPrincipal(result.rows[0]) : null;
  }

  async logout(token: string) {
    await this.db.query("UPDATE auth_sessions SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL", [
      hashToken(token),
    ]);
  }

  async requestOtp(input: OtpRequestDto) {
    const tenant = await this.db.query<{ id: string }>("SELECT id FROM tenants WHERE slug = $1 AND status = 'ACTIVE'", [
      input.tenantSlug.trim(),
    ]);
    if (!tenant.rows[0]) throw new UnauthorizedException("The requested institution is not available.");
    const code = randomBytes(3).toString("hex").slice(0, 6);
    await this.db.query(
      `INSERT INTO auth_challenges (tenant_id, mobile, purpose, code_hash, expires_at)
       VALUES ($1, $2, 'LOGIN', $3, now() + interval '10 minutes')`,
      [tenant.rows[0].id, input.mobile.trim(), hashToken(code)],
    );
    return { accepted: true, expiresInSeconds: 600 };
  }

  async verifyOtp(input: OtpVerifyDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const result = await this.db.query<{ id: string; user_id: string }>(
      `SELECT c.id, u.id AS user_id
       FROM auth_challenges c
       JOIN users u ON u.tenant_id = c.tenant_id AND u.mobile = c.mobile
       WHERE c.mobile = $1 AND c.code_hash = $2 AND c.purpose = 'LOGIN'
         AND c.consumed_at IS NULL AND c.expires_at > now() AND u.status = 'ACTIVE'
       ORDER BY c.created_at DESC LIMIT 1`,
      [input.mobile.trim(), hashToken(input.code)],
    );
    if (!result.rows[0]) throw new UnauthorizedException("Invalid or expired verification code.");
    await this.db.query("UPDATE auth_challenges SET consumed_at = now() WHERE id = $1", [result.rows[0].id]);
    return this.startSession(result.rows[0].user_id, metadata);
  }

  providerStatus(provider: "google" | "microsoft" | "sso") {
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
}