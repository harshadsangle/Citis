import { createHash, randomBytes } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { DatabaseService } from "../../database/database.service";
import type { AuthenticatedUser } from "../../common/request-context";
import type { LoginDto, OtpRequestDto, OtpVerifyDto } from "./auth.dto";

const PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const SESSION_DAYS = 7;

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
}): AuthenticatedUser {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    roles: row.roles ?? [],
    permissions: row.permissions ?? [],
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
        ), '[]'::json) AS permissions
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