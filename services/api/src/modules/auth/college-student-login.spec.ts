import assert from "node:assert/strict";
import test from "node:test";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { hashPassword } from "./password-security";

const metadata = { ipAddress: "127.0.0.1", userAgent: "test" };

function serviceWith(rows: Array<Record<string, unknown>>) {
  const queries: string[] = [];
  const db = {
    query: async (text: string) => {
      queries.push(text);
      return { rows };
    },
  };
  const limiter = {
    assertAllowed: () => undefined,
    record: () => undefined,
    clear: () => undefined,
  };
  const delivery = { deliver: async () => undefined };
  return { service: new AuthService(db as never, limiter as never, delivery as never), queries };
}

test("college login accepts a College User ID without email or phone", async () => {
  const passwordHash = await hashPassword("StrongPass1!");
  const { service, queries } = serviceWith([{
    id: "student-1",
    tenant_id: "tenant-1",
    email: null,
    password_hash: passwordHash,
    mfa_enabled: false,
    mfa_channel: null,
  }]);

  const session = await service.collegeStudentLogin({ collegeUserId: "COL-001", password: "StrongPass1!" }, metadata);
  assert.ok(session.token);
  assert.ok(session.expiresAt instanceof Date);
  assert.equal(queries.some((query) => query.includes("lower(sp.college_user_id)")), true);
});

test("college login rejects wrong passwords and inactive or missing students", async () => {
  const passwordHash = await hashPassword("StrongPass1!");
  const { service } = serviceWith([{
    id: "student-1",
    tenant_id: "tenant-1",
    email: null,
    password_hash: passwordHash,
    mfa_enabled: false,
    mfa_channel: null,
  }]);
  await assert.rejects(
    service.collegeStudentLogin({ collegeUserId: "COL-001", password: "WrongPass1!" }, metadata),
    UnauthorizedException,
  );

  const inactive = serviceWith([]);
  await assert.rejects(
    inactive.service.collegeStudentLogin({ collegeUserId: "COL-INACTIVE", password: "StrongPass1!" }, metadata),
    UnauthorizedException,
  );
});