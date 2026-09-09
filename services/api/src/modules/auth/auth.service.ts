import { createHash, randomBytes, randomInt } from "node:crypto";
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import type { AuthenticatedUser } from "../../common/request-context";
import type { AccessScope } from "../../common/access-scope";
import { AuthRateLimiter } from "./auth.rate-limit";
import type {
  ForgotPasswordDto,
  LoginDto,
  OtpRequestDto,
  OtpVerifyDto,
  RegisterDto,
  ResetPasswordDto,
  ChangePasswordDto,
  MfaChallengeDto,
  MfaEnrollmentDto,
  DirectStudentContactDto,
  DirectStudentOtpVerifyDto,
  DirectStudentRegistrationDto,
} from "./auth.dto";
import type { CollegeStudentLoginDto } from "../college-students/college-students.dto";
import { hashPassword, verifyPassword } from "./password-security";
import { OtpDeliveryService, type OtpChannel, type OtpPurpose } from "./otp-delivery.service";

const PLATFORM_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const SESSION_DAYS = 7;
const RESET_TOKEN_MINUTES = 60;
const VERIFICATION_TOKEN_HOURS = 24;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const RESET_WINDOW_MS = 60 * 60 * 1000;
const REGISTRATION_WINDOW_MS = 60 * 60 * 1000;
const OTP_WINDOW_MS = 10 * 60 * 1000;
const PASSWORD_CHANGE_WINDOW_MS = 15 * 60 * 1000;
const MFA_WINDOW_MS = 15 * 60 * 1000;
const MFA_CHALLENGE_MINUTES = 10;
const MFA_MAX_ATTEMPTS = 5;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toPrincipal(row: {
  id: string;
  tenant_id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  student_type?: "COLLEGE_STUDENT" | "DIRECT_STUDENT" | null;
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
    studentType: row.student_type ?? null,
    roles: row.roles ?? [],
    permissions: row.permissions ?? [],
    scopes: row.scopes ?? [],
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly rateLimiter: AuthRateLimiter,
    private readonly otpDelivery: OtpDeliveryService,
  ) {}

  async login(input: LoginDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const email = input.email.trim().toLowerCase();
    const ipKey = metadata.ipAddress || "unknown";
    const accountKey = `${ipKey}:${email}`;
    this.rateLimiter.assertAllowed("login-ip", ipKey, 30, LOGIN_WINDOW_MS);
    this.rateLimiter.assertAllowed("login-account", accountKey, 10, LOGIN_WINDOW_MS);
    const result = await this.db.query<{
      id: string;
      tenant_id: string;
      email: string | null;
      first_name: string;
      last_name: string;
      password_hash: string | null;
      mobile: string | null;
      mfa_enabled: boolean;
      mfa_channel: OtpChannel | null;
      status: string;
      tenant_slug: string;
    }>(
       `SELECT u.id, u.tenant_id, u.email, u.first_name, u.last_name, u.password_hash,
               u.mobile, u.mfa_enabled, u.mfa_channel, u.status, t.slug AS tenant_slug
       FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE lower(u.email) = lower($1)
         AND ($2::text IS NULL OR t.slug = $2)
         AND t.status = 'ACTIVE'
       ORDER BY u.created_at
       LIMIT 2`,
       [email, input.tenantSlug?.trim() || null],
    );
    const user = result.rows.length === 1 ? result.rows[0] : undefined;
    if (!user || user.status !== "ACTIVE" || !user.password_hash || !(await verifyPassword(input.password, user.password_hash))) {
      this.rateLimiter.record("login-ip", ipKey, LOGIN_WINDOW_MS);
      this.rateLimiter.record("login-account", accountKey, LOGIN_WINDOW_MS);
      throw new UnauthorizedException("Invalid email or password.");
    }
    this.rateLimiter.clear("login-account", accountKey);

    if (user.mfa_enabled && user.mfa_channel) {
      return {
        mfaRequired: true as const,
        ...(await this.createMfaChallenge(user.id, user.mfa_channel, "LOGIN", metadata)),
      };
    }
    return this.completeLogin(user.id, user.tenant_id, metadata);
  }

  async collegeStudentLogin(input: CollegeStudentLoginDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const collegeUserId = input.collegeUserId.trim();
    const ipKey = metadata.ipAddress || "unknown";
    const accountKey = `${ipKey}:college:${input.tenantSlug?.trim() || "citis-platform"}:${collegeUserId.toLowerCase()}`;
    this.rateLimiter.assertAllowed("login-ip", ipKey, 30, LOGIN_WINDOW_MS);
    this.rateLimiter.assertAllowed("login-account", accountKey, 10, LOGIN_WINDOW_MS);
    const result = await this.db.query<{
      id: string;
      tenant_id: string;
      email: string | null;
      password_hash: string | null;
      mfa_enabled: boolean;
      mfa_channel: OtpChannel | null;
    }>(
      `SELECT u.id, u.tenant_id, u.email, u.password_hash, u.mfa_enabled, u.mfa_channel
       FROM lms_student_profiles sp
       JOIN users u ON u.tenant_id = sp.tenant_id AND u.id = sp.user_id
       JOIN tenants t ON t.id = sp.tenant_id
       WHERE lower(sp.college_user_id) = lower($1)
         AND sp.student_type = 'COLLEGE_STUDENT'
         AND sp.status = 'ACTIVE'
         AND u.status = 'ACTIVE'
         AND t.status = 'ACTIVE'
         AND ($2::text IS NULL OR t.slug = $2)
       LIMIT 2`,
      [collegeUserId, input.tenantSlug?.trim() || null],
    );
    const student = result.rows.length === 1 ? result.rows[0] : undefined;
    if (!student || !student.password_hash || !(await verifyPassword(input.password, student.password_hash))) {
      this.rateLimiter.record("login-ip", ipKey, LOGIN_WINDOW_MS);
      this.rateLimiter.record("login-account", accountKey, LOGIN_WINDOW_MS);
      throw new UnauthorizedException("Invalid College User ID or password.");
    }
    this.rateLimiter.clear("login-account", accountKey);
    if (student.mfa_enabled && student.mfa_channel) {
      return {
        mfaRequired: true as const,
        ...(await this.createMfaChallenge(student.id, student.mfa_channel, "LOGIN", metadata)),
      };
    }
    return this.completeLogin(student.id, student.tenant_id, metadata);
  }

  async register(input: RegisterDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const ipKey = metadata.ipAddress || "unknown";
    this.rateLimiter.assertAllowed("register-ip", ipKey, 10, REGISTRATION_WINDOW_MS);
    this.rateLimiter.record("register-ip", ipKey, REGISTRATION_WINDOW_MS);
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
    const passwordHash = await hashPassword(input.password);
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
       ...(process.env.NODE_ENV !== "production" && process.env.AUTH_EXPOSE_DEV_TOKENS === "true"
         ? { developmentVerificationToken: verificationToken }
         : {}),
    };
  }

  async requestPasswordReset(input: ForgotPasswordDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const email = input.email.trim().toLowerCase();
    const ipKey = metadata.ipAddress || "unknown";
    const accountKey = `${ipKey}:${email}`;
    this.rateLimiter.assertAllowed("reset-ip", ipKey, 10, RESET_WINDOW_MS);
    this.rateLimiter.assertAllowed("reset-account", accountKey, 5, RESET_WINDOW_MS);
    this.rateLimiter.record("reset-ip", ipKey, RESET_WINDOW_MS);
    this.rateLimiter.record("reset-account", accountKey, RESET_WINDOW_MS);
    const result = await this.db.query<{ id: string }>(
      `SELECT u.id
       FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE lower(u.email) = lower($1)
         AND ($2::text IS NULL OR t.slug = $2)
         AND t.status = 'ACTIVE'
         AND u.status <> 'ARCHIVED'
       ORDER BY u.created_at
       LIMIT 2`,
      [email, input.tenantSlug?.trim() || null],
    );
    // If the email exists in more than one tenant and no tenant was supplied,
    // do not issue a reset for an arbitrary account.
    if (result.rows.length !== 1) return { accepted: true };

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
      ...(process.env.NODE_ENV !== "production" && process.env.AUTH_EXPOSE_DEV_TOKENS === "true"
        ? { developmentResetToken: rawToken }
        : {}),
    };
  }

  async resetPassword(token: string, input: ResetPasswordDto) {
    if (!TOKEN_PATTERN.test(token)) throw new BadRequestException("This password reset link is invalid or has expired.");
    const passwordHash = await hashPassword(input.password);
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

  async changePassword(
    userId: string,
    input: ChangePasswordDto,
    metadata: { ipAddress?: string },
    currentSessionToken: string,
  ) {
    const ipKey = metadata.ipAddress || "unknown";
    const limiterKey = `${ipKey}:${userId}`;
    this.rateLimiter.assertAllowed("password-change", limiterKey, 5, PASSWORD_CHANGE_WINDOW_MS);

    const current = await this.db.query<{ password_hash: string | null }>(
      "SELECT password_hash FROM users WHERE id = $1 AND status = 'ACTIVE' LIMIT 1",
      [userId],
    );
    const currentHash = current.rows[0]?.password_hash;
    if (!currentHash || !(await verifyPassword(input.currentPassword, currentHash))) {
      this.rateLimiter.record("password-change", limiterKey, PASSWORD_CHANGE_WINDOW_MS);
      throw new UnauthorizedException("Current password is incorrect.");
    }
    if (await verifyPassword(input.newPassword, currentHash)) {
      throw new BadRequestException("Choose a new password that is different from the current password.");
    }

    const passwordHash = await hashPassword(input.newPassword);
    const sessionHash = hashToken(currentSessionToken);
    await this.db.transaction(async (client) => {
      const updated = await client.query(
        `UPDATE users
         SET password_hash = $1, updated_at = now()
         WHERE id = $2 AND status = 'ACTIVE' AND password_hash = $3`,
        [passwordHash, userId, currentHash],
      );
      if (!updated.rowCount) {
        throw new ConflictException("The password changed before this request completed. Please sign in again.");
      }
      await client.query(
        `UPDATE auth_sessions
         SET revoked_at = now()
         WHERE user_id = $1 AND revoked_at IS NULL AND token_hash <> $2`,
        [userId, sessionHash],
      );
    });
    this.rateLimiter.clear("password-change", limiterKey);
    return { changed: true };
  }

  private async completeLogin(userId: string, tenantId: string, metadata: { ipAddress?: string; userAgent?: string }) {
    await this.db.query("UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1 AND tenant_id = $2", [
      userId,
      tenantId,
    ]);
    return this.startSession(userId, metadata);
  }

  async mfaStatus(userId: string) {
    const result = await this.db.query<{ mfa_enabled: boolean; mfa_channel: OtpChannel | null }>(
      "SELECT mfa_enabled, mfa_channel FROM users WHERE id = $1 AND status = 'ACTIVE' LIMIT 1",
      [userId],
    );
    return {
      enabled: Boolean(result.rows[0]?.mfa_enabled),
      channel: result.rows[0]?.mfa_enabled ? result.rows[0]?.mfa_channel ?? null : null,
    };
  }

  async beginMfaEnrollment(userId: string, input: MfaEnrollmentDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const user = await this.getMfaUser(userId);
    if (!user.password_hash || !(await verifyPassword(input.currentPassword, user.password_hash))) {
      this.rateLimiter.record("mfa-setup", `${metadata.ipAddress || "unknown"}:${userId}`, MFA_WINDOW_MS);
      throw new UnauthorizedException("Current password is incorrect.");
    }
    if (user.mfa_enabled) {
      throw new BadRequestException("MFA is already enabled. Use the reset flow to change its delivery method.");
    }
    return this.createMfaChallenge(userId, input.channel, "ENROLL", metadata);
  }

  async verifyMfaEnrollment(userId: string, input: MfaChallengeDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const challenge = await this.consumeMfaChallenge(input, "ENROLL", userId, metadata);
    await this.db.query(
      "UPDATE users SET mfa_enabled = true, mfa_channel = $1, updated_at = now() WHERE id = $2",
      [challenge.channel, userId],
    );
    return { enabled: true, channel: challenge.channel };
  }

  async beginMfaReset(userId: string, input: MfaEnrollmentDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const user = await this.getMfaUser(userId);
    if (!user.password_hash || !(await verifyPassword(input.currentPassword, user.password_hash))) {
      this.rateLimiter.record("mfa-reset", `${metadata.ipAddress || "unknown"}:${userId}`, MFA_WINDOW_MS);
      throw new UnauthorizedException("Current password is incorrect.");
    }
    return this.createMfaChallenge(userId, input.channel, "RESET", metadata);
  }

  async verifyMfaReset(userId: string, input: MfaChallengeDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const challenge = await this.consumeMfaChallenge(input, "RESET", userId, metadata);
    await this.db.query(
      "UPDATE users SET mfa_enabled = true, mfa_channel = $1, updated_at = now() WHERE id = $2",
      [challenge.channel, userId],
    );
    return { enabled: true, channel: challenge.channel };
  }

  async beginMfaDisable(userId: string, currentPassword: string, metadata: { ipAddress?: string; userAgent?: string }) {
    const user = await this.getMfaUser(userId);
    if (!user.mfa_enabled || !user.mfa_channel) {
      throw new BadRequestException("MFA is not enabled.");
    }
    if (!user.password_hash || !(await verifyPassword(currentPassword, user.password_hash))) {
      this.rateLimiter.record("mfa-disable", `${metadata.ipAddress || "unknown"}:${userId}`, MFA_WINDOW_MS);
      throw new UnauthorizedException("Current password is incorrect.");
    }
    return this.createMfaChallenge(userId, user.mfa_channel, "DISABLE", metadata);
  }

  async verifyMfaDisable(userId: string, input: MfaChallengeDto, metadata: { ipAddress?: string; userAgent?: string }) {
    await this.consumeMfaChallenge(input, "DISABLE", userId, metadata);
    await this.db.query("UPDATE users SET mfa_enabled = false, mfa_channel = NULL, updated_at = now() WHERE id = $1", [userId]);
    return { enabled: false };
  }

  async verifyMfaLogin(input: MfaChallengeDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const challenge = await this.consumeMfaChallenge(input, "LOGIN", undefined, metadata);
    const user = await this.db.query<{ tenant_id: string }>(
      "SELECT tenant_id FROM users WHERE id = $1 AND status = 'ACTIVE' LIMIT 1",
      [challenge.userId],
    );
    if (!user.rows[0]) throw new UnauthorizedException("The MFA challenge is no longer valid.");
    return this.completeLogin(challenge.userId, user.rows[0].tenant_id, metadata);
  }

  private async getMfaUser(userId: string) {
    const result = await this.db.query<{
      id: string;
      email: string | null;
      mobile: string | null;
      password_hash: string | null;
      mfa_enabled: boolean;
      mfa_channel: OtpChannel | null;
    }>(
      `SELECT id, email, mobile, password_hash, mfa_enabled, mfa_channel
       FROM users WHERE id = $1 AND status = 'ACTIVE' LIMIT 1`,
      [userId],
    );
    if (!result.rows[0]) throw new UnauthorizedException("The authenticated account is no longer active.");
    return result.rows[0];
  }

  private async createMfaChallenge(
    userId: string,
    channel: OtpChannel,
    purpose: OtpPurpose,
    metadata: { ipAddress?: string; userAgent?: string },
  ) {
    const user = await this.getMfaUser(userId);
    const destination = channel === "EMAIL" ? user.email : user.mobile;
    if (!destination) {
      throw new BadRequestException(
        channel === "EMAIL"
          ? "An email address is required for email MFA."
          : "A mobile number is required for SMS MFA.",
      );
    }

    const ipKey = metadata.ipAddress || "unknown";
    const userKey = `${ipKey}:${userId}:${channel}:${purpose}`;
    this.rateLimiter.assertAllowed("mfa-request-ip", ipKey, 20, MFA_WINDOW_MS);
    this.rateLimiter.assertAllowed("mfa-request-user", userKey, 5, MFA_WINDOW_MS);
    this.rateLimiter.record("mfa-request-ip", ipKey, MFA_WINDOW_MS);
    this.rateLimiter.record("mfa-request-user", userKey, MFA_WINDOW_MS);

    const challengeToken = randomBytes(32).toString("base64url");
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    await this.db.transaction(async (client) => {
      await client.query(
        `UPDATE auth_mfa_challenges
         SET consumed_at = now()
         WHERE user_id = $1 AND purpose = $2 AND consumed_at IS NULL`,
        [userId, purpose],
      );
      await client.query(
        `INSERT INTO auth_mfa_challenges
          (user_id, challenge_token_hash, channel, purpose, code_hash, expires_at, requested_ip, requested_user_agent)
         VALUES ($1, $2, $3, $4, $5, now() + interval '${MFA_CHALLENGE_MINUTES} minutes', $6, $7)`,
        [
          userId,
          hashToken(challengeToken),
          channel,
          purpose,
          hashToken(code),
          metadata.ipAddress ?? null,
          metadata.userAgent ?? null,
        ],
      );
    });

    try {
      await this.otpDelivery.deliver({ channel, destination, code, purpose });
    } catch (error) {
      await this.db.query(
        "UPDATE auth_mfa_challenges SET consumed_at = now() WHERE challenge_token_hash = $1 AND consumed_at IS NULL",
        [hashToken(challengeToken)],
      );
      throw error;
    }

    return {
      challengeToken,
      channel,
      expiresInSeconds: MFA_CHALLENGE_MINUTES * 60,
    };
  }

  private async consumeMfaChallenge(
    input: MfaChallengeDto,
    purpose: OtpPurpose,
    expectedUserId: string | undefined,
    metadata: { ipAddress?: string; userAgent?: string },
  ) {
    if (!TOKEN_PATTERN.test(input.challengeToken)) {
      throw new UnauthorizedException("Invalid or expired MFA challenge.");
    }
    const ipKey = metadata.ipAddress || "unknown";
    this.rateLimiter.assertAllowed("mfa-verify-ip", ipKey, 20, MFA_WINDOW_MS);
    this.rateLimiter.assertAllowed("mfa-verify-token", input.challengeToken, MFA_MAX_ATTEMPTS, MFA_WINDOW_MS);

    const result = await this.db.transaction(async (client) => {
      const challenge = await client.query<{
        id: string;
        user_id: string;
        channel: OtpChannel;
        code_hash: string;
        attempts: number;
      }>(
        `SELECT id, user_id, channel, code_hash, attempts
         FROM auth_mfa_challenges
         WHERE challenge_token_hash = $1
           AND purpose = $2
           AND consumed_at IS NULL
           AND expires_at > now()
           AND ($3::uuid IS NULL OR user_id = $3)
         FOR UPDATE`,
        [hashToken(input.challengeToken), purpose, expectedUserId ?? null],
      );
      const row = challenge.rows[0];
      if (!row || row.attempts >= MFA_MAX_ATTEMPTS) return { valid: false as const };
      if (row.code_hash !== hashToken(input.code)) {
        await client.query(
          `UPDATE auth_mfa_challenges
           SET attempts = attempts + 1,
               consumed_at = CASE WHEN attempts + 1 >= $2 THEN now() ELSE consumed_at END
           WHERE id = $1`,
          [row.id, MFA_MAX_ATTEMPTS],
        );
        return { valid: false as const };
      }
      await client.query("UPDATE auth_mfa_challenges SET consumed_at = now() WHERE id = $1", [row.id]);
      return { valid: true as const, userId: row.user_id, channel: row.channel };
    });

    if (!result.valid) {
      this.rateLimiter.record("mfa-verify-ip", ipKey, MFA_WINDOW_MS);
      this.rateLimiter.record("mfa-verify-token", input.challengeToken, MFA_WINDOW_MS);
      throw new UnauthorizedException("Invalid or expired MFA code.");
    }
    this.rateLimiter.clear("mfa-verify-ip", ipKey);
    this.rateLimiter.clear("mfa-verify-token", input.challengeToken);
    return result;
  }

  async verifyEmail(token: string) {
    if (!TOKEN_PATTERN.test(token)) throw new BadRequestException("This verification link is invalid or has expired.");
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
      student_type: "COLLEGE_STUDENT" | "DIRECT_STUDENT" | null;
      roles: Array<{ code: string; name: string }> | null;
      permissions: string[] | null;
      scopes: AccessScope[] | null;
    }>(
       `SELECT u.id, u.tenant_id, u.email, u.first_name, u.last_name,
         (SELECT sp.student_type FROM lms_student_profiles sp
          WHERE sp.tenant_id = u.tenant_id AND sp.user_id = u.id
          LIMIT 1) AS student_type,
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

  private directStudentContact(input: { email?: string; mobile?: string }) {
    const email = input.email?.trim().toLowerCase() || null;
    const mobile = input.mobile?.trim().replace(/[()\s-]/g, "") || null;
    if ((email ? 1 : 0) + (mobile ? 1 : 0) !== 1) {
      throw new BadRequestException("Choose either an email address or a phone number.");
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException("Email address is invalid.");
    }
    if (mobile && !/^\+?[0-9][0-9 ()-]{7,19}$/.test(mobile)) {
      throw new BadRequestException("Phone number is invalid.");
    }
    return {
      channel: email ? "EMAIL" as const : "SMS" as const,
      contact: email || mobile!,
      email,
      mobile,
    };
  }

  private async directStudentTenant(tenantSlug?: string) {
    const tenant = await this.db.query<{ id: string }>(
      "SELECT id FROM tenants WHERE slug = $1 AND status = 'ACTIVE' LIMIT 1",
      [tenantSlug?.trim() || "citis-platform"],
    );
    if (!tenant.rows[0]) throw new BadRequestException("The requested institution is not available.");
    return tenant.rows[0].id;
  }

  private directStudentRateLimit(ipAddress: string | undefined, contact: string) {
    const ipKey = ipAddress || "unknown";
    const contactKey = `direct-registration:${contact.toLowerCase()}`;
    this.rateLimiter.assertAllowed("direct-registration-ip", ipKey, 10, OTP_WINDOW_MS);
    this.rateLimiter.assertAllowed("direct-registration-contact", contactKey, 5, OTP_WINDOW_MS);
    this.rateLimiter.record("direct-registration-ip", ipKey, OTP_WINDOW_MS);
    this.rateLimiter.record("direct-registration-contact", contactKey, OTP_WINDOW_MS);
    return { ipKey, contactKey };
  }

  private assertDirectStudentVerificationAllowed(ipAddress: string | undefined, contact: string) {
    const ipKey = ipAddress || "unknown";
    const contactKey = `direct-registration:${contact.toLowerCase()}`;
    this.rateLimiter.assertAllowed("direct-registration-ip", ipKey, 20, OTP_WINDOW_MS);
    this.rateLimiter.assertAllowed("direct-registration-contact", contactKey, 5, OTP_WINDOW_MS);
    return { ipKey, contactKey };
  }

  private async deliverDirectStudentOtp(
    challengeId: string,
    channel: OtpChannel,
    contact: string,
    code: string,
    metadata: { ipAddress?: string; userAgent?: string },
  ) {
    try {
      await this.otpDelivery.deliver({ channel, destination: contact, code, purpose: "REGISTER" });
    } catch (error) {
      await this.db.query(
        "UPDATE auth_challenges SET consumed_at = now() WHERE id = $1 AND consumed_at IS NULL",
        [challengeId],
      );
      throw error;
    }
    return {
      accepted: true,
      channel,
      expiresInSeconds: 600,
    };
  }

  async registerDirectStudent(
    input: DirectStudentRegistrationDto,
    metadata: { ipAddress?: string; userAgent?: string },
  ) {
    const contact = this.directStudentContact(input);
    const tenantId = await this.directStudentTenant(input.tenantSlug);
    const limiter = this.directStudentRateLimit(metadata.ipAddress, contact.contact);
    const existing = await this.db.query(
      `SELECT 1 FROM users
       WHERE tenant_id = $1 AND status <> 'ARCHIVED'
         AND (($2::text IS NOT NULL AND lower(email) = lower($2))
           OR ($3::text IS NOT NULL AND regexp_replace(coalesce(mobile, ''), '[^0-9+]', '', 'g') = $3))
       LIMIT 1`,
      [tenantId, contact.email, contact.mobile],
    );

    // Keep the response identical for existing and new contacts to prevent account enumeration.
    if (existing.rows[0]) {
      return { accepted: true, channel: contact.channel, expiresInSeconds: 600 };
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const passwordHash = await hashPassword(input.password);
    await this.db.query(
      `UPDATE auth_challenges
       SET consumed_at = now()
       WHERE tenant_id = $1 AND contact = $2 AND purpose = 'REGISTER' AND consumed_at IS NULL`,
      [tenantId, contact.contact],
    );
    const challenge = await this.db.query<{ id: string }>(
      `INSERT INTO auth_challenges
        (tenant_id, mobile, contact, channel, purpose, code_hash, expires_at,
         registration_first_name, registration_last_name, registration_password_hash)
       VALUES ($1, $2, $3, $4, 'REGISTER', $5, now() + interval '10 minutes', $6, $7, $8)
       RETURNING id`,
      [
        tenantId,
        contact.mobile,
        contact.contact,
        contact.channel,
        hashToken(code),
        input.firstName.trim(),
        input.lastName?.trim() || "",
        passwordHash,
      ],
    );
    return this.deliverDirectStudentOtp(challenge.rows[0].id, contact.channel, contact.contact, code, metadata);
  }

  async resendDirectStudentOtp(
    input: DirectStudentContactDto,
    metadata: { ipAddress?: string; userAgent?: string },
  ) {
    const contact = this.directStudentContact(input);
    const tenantId = await this.directStudentTenant(input.tenantSlug);
    this.directStudentRateLimit(metadata.ipAddress, contact.contact);
    const pending = await this.db.query<{
      id: string;
      registration_first_name: string;
      registration_last_name: string;
      registration_password_hash: string;
    }>(
      `SELECT id, registration_first_name, registration_last_name, registration_password_hash
       FROM auth_challenges
       WHERE tenant_id = $1 AND contact = $2 AND purpose = 'REGISTER'
         AND consumed_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC
       LIMIT 1`,
      [tenantId, contact.contact],
    );
    if (!pending.rows[0]) return { accepted: true, channel: contact.channel, expiresInSeconds: 600 };

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    await this.db.query(
      "UPDATE auth_challenges SET consumed_at = now() WHERE tenant_id = $1 AND contact = $2 AND purpose = 'REGISTER' AND consumed_at IS NULL",
      [tenantId, contact.contact],
    );
    const replacement = await this.db.query<{ id: string }>(
      `INSERT INTO auth_challenges
        (tenant_id, mobile, contact, channel, purpose, code_hash, expires_at,
         registration_first_name, registration_last_name, registration_password_hash)
       VALUES ($1, $2, $3, $4, 'REGISTER', $5, now() + interval '10 minutes', $6, $7, $8)
       RETURNING id`,
      [
        tenantId,
        contact.mobile,
        contact.contact,
        contact.channel,
        hashToken(code),
        pending.rows[0].registration_first_name,
        pending.rows[0].registration_last_name,
        pending.rows[0].registration_password_hash,
      ],
    );
    return this.deliverDirectStudentOtp(replacement.rows[0].id, contact.channel, contact.contact, code, metadata);
  }

  async verifyDirectStudentOtp(
    input: DirectStudentOtpVerifyDto,
    metadata: { ipAddress?: string; userAgent?: string },
  ) {
    const contact = this.directStudentContact(input);
    const tenantId = await this.directStudentTenant(input.tenantSlug);
    const limiter = this.assertDirectStudentVerificationAllowed(metadata.ipAddress, contact.contact);
    const result = await this.db.transaction(async (client) => {
      const challenge = await client.query<{
        id: string;
        registration_first_name: string;
        registration_last_name: string;
        registration_password_hash: string;
      }>(
        `SELECT id, registration_first_name, registration_last_name, registration_password_hash
         FROM auth_challenges
         WHERE tenant_id = $1 AND contact = $2 AND channel = $3 AND purpose = 'REGISTER'
           AND code_hash = $4 AND consumed_at IS NULL AND expires_at > now() AND attempts < 5
         ORDER BY created_at DESC
         LIMIT 1
         FOR UPDATE`,
        [tenantId, contact.contact, contact.channel, hashToken(input.code)],
      );
      if (!challenge.rows[0]) {
        await client.query(
          `UPDATE auth_challenges
           SET attempts = attempts + 1
           WHERE tenant_id = $1 AND contact = $2 AND purpose = 'REGISTER'
             AND consumed_at IS NULL AND expires_at > now()`,
          [tenantId, contact.contact],
        );
        return { valid: false as const };
      }

      const existing = await client.query(
        `SELECT id FROM users
         WHERE tenant_id = $1 AND status <> 'ARCHIVED'
           AND (($2::text IS NOT NULL AND lower(email) = lower($2))
             OR ($3::text IS NOT NULL AND regexp_replace(coalesce(mobile, ''), '[^0-9+]', '', 'g') = $3))
         LIMIT 1`,
        [tenantId, contact.email, contact.mobile],
      );
      if (existing.rows[0]) {
        await client.query("UPDATE auth_challenges SET consumed_at = now(), registration_password_hash = NULL WHERE id = $1", [challenge.rows[0].id]);
        return { duplicate: true as const };
      }

      const role = await client.query<{ id: string }>(
        "SELECT id FROM roles WHERE tenant_id = $1 AND code = 'STUDENT' AND status = 'ACTIVE' LIMIT 1",
        [tenantId],
      );
      if (!role.rows[0]) throw new Error("The student role is not configured for this tenant.");

      const user = await client.query<{ id: string }>(
        `INSERT INTO users
          (tenant_id, email, mobile, password_hash, first_name, last_name,
           status, email_verified_at, mobile_verified_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE',
                 CASE WHEN $7 = 'EMAIL' THEN now() ELSE NULL END,
                 CASE WHEN $7 = 'SMS' THEN now() ELSE NULL END)
         RETURNING id`,
        [
          tenantId,
          contact.email,
          contact.mobile,
          challenge.rows[0].registration_password_hash,
          challenge.rows[0].registration_first_name,
          challenge.rows[0].registration_last_name,
          contact.channel,
        ],
      );
      await client.query(
        `INSERT INTO user_roles (tenant_id, user_id, role_id)
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [tenantId, user.rows[0].id, role.rows[0].id],
      );
      await client.query(
        `INSERT INTO lms_student_profiles (tenant_id, user_id, student_type, institution_id, status)
         VALUES ($1, $2, 'DIRECT_STUDENT', NULL, 'ACTIVE')`,
        [tenantId, user.rows[0].id],
      );
      await client.query(
        `INSERT INTO lms_activity_events
          (tenant_id, actor_user_id, subject_user_id, event_type, resource_type, resource_id, metadata)
         VALUES ($1, $2, $2, 'DIRECT_STUDENT_REGISTERED', 'direct_student', $2, $3::jsonb)`,
        [tenantId, user.rows[0].id, JSON.stringify({ channel: contact.channel })],
      );
      await client.query(
        "UPDATE auth_challenges SET consumed_at = now(), registration_password_hash = NULL WHERE id = $1",
        [challenge.rows[0].id],
      );
      return { valid: true as const, userId: user.rows[0].id };
    });

    if ("duplicate" in result && result.duplicate) {
      throw new ConflictException("Registration could not be completed. Please sign in or use another contact.");
    }
    if (!result.valid) {
      this.rateLimiter.record("direct-registration-ip", limiter.ipKey, OTP_WINDOW_MS);
      this.rateLimiter.record("direct-registration-contact", limiter.contactKey, OTP_WINDOW_MS);
      throw new UnauthorizedException("Invalid or expired verification code.");
    }
    this.rateLimiter.clear("direct-registration-ip", limiter.ipKey);
    this.rateLimiter.clear("direct-registration-contact", limiter.contactKey);
    return this.startSession(result.userId, metadata);
  }

  async requestOtp(input: OtpRequestDto, metadata: { ipAddress?: string }) {
    const ipKey = metadata.ipAddress || "unknown";
    const mobileKey = `${ipKey}:${input.mobile.trim()}`;
    this.rateLimiter.assertAllowed("otp-request-ip", ipKey, 10, OTP_WINDOW_MS);
    this.rateLimiter.assertAllowed("otp-request-mobile", mobileKey, 5, OTP_WINDOW_MS);
    this.rateLimiter.record("otp-request-ip", ipKey, OTP_WINDOW_MS);
    this.rateLimiter.record("otp-request-mobile", mobileKey, OTP_WINDOW_MS);
    const tenant = await this.db.query<{ id: string }>("SELECT id FROM tenants WHERE slug = $1 AND status = 'ACTIVE'", [
      input.tenantSlug.trim(),
    ]);
    if (!tenant.rows[0]) throw new UnauthorizedException("The requested institution is not available.");
    const code = randomBytes(3).toString("hex").slice(0, 6);
    await this.db.query(
      `UPDATE auth_challenges
       SET consumed_at = now()
       WHERE tenant_id = $1 AND mobile = $2 AND purpose = 'LOGIN' AND consumed_at IS NULL`,
      [tenant.rows[0].id, input.mobile.trim()],
    );
    await this.db.query(
      `INSERT INTO auth_challenges (tenant_id, mobile, contact, channel, purpose, code_hash, expires_at)
        VALUES ($1, $2, $2, 'SMS', 'LOGIN', $3, now() + interval '10 minutes')`,
      [tenant.rows[0].id, input.mobile.trim(), hashToken(code)],
    );
    return { accepted: true, expiresInSeconds: 600 };
  }

  async verifyOtp(input: OtpVerifyDto, metadata: { ipAddress?: string; userAgent?: string }) {
    const ipKey = metadata.ipAddress || "unknown";
    const mobileKey = `${ipKey}:${input.mobile.trim()}`;
    this.rateLimiter.assertAllowed("otp-verify-ip", ipKey, 20, OTP_WINDOW_MS);
    this.rateLimiter.assertAllowed("otp-verify-mobile", mobileKey, 5, OTP_WINDOW_MS);
    const result = await this.db.query<{ id: string; user_id: string }>(
      `SELECT c.id, u.id AS user_id
       FROM auth_challenges c
       JOIN users u ON u.tenant_id = c.tenant_id AND u.mobile = c.mobile
       JOIN tenants t ON t.id = c.tenant_id
       WHERE c.mobile = $1 AND c.code_hash = $2 AND c.purpose = 'LOGIN'
         AND t.slug = $3
         AND c.consumed_at IS NULL AND c.expires_at > now() AND c.attempts < 5 AND u.status = 'ACTIVE'
       ORDER BY c.created_at DESC LIMIT 1`,
      [input.mobile.trim(), hashToken(input.code), input.tenantSlug.trim()],
    );
    if (!result.rows[0]) {
      await this.db.query(
        `UPDATE auth_challenges
         SET attempts = attempts + 1
         WHERE mobile = $1 AND purpose = 'LOGIN' AND consumed_at IS NULL AND expires_at > now()`,
        [input.mobile.trim()],
      );
      this.rateLimiter.record("otp-verify-ip", ipKey, OTP_WINDOW_MS);
      this.rateLimiter.record("otp-verify-mobile", mobileKey, OTP_WINDOW_MS);
      throw new UnauthorizedException("Invalid or expired verification code.");
    }
    this.rateLimiter.clear("otp-verify-ip", ipKey);
    this.rateLimiter.clear("otp-verify-mobile", mobileKey);
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