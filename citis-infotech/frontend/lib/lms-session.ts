import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { queryLms } from "@/lib/lms-db";
import type { LmsRole } from "@/lib/lms-auth";

export const LMS_SESSION_COOKIE = "citis_lms_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: number;
  expiresAt: number;
};

function getSessionSecret() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required for LMS authentication.");
  }
  return process.env.SESSION_SECRET;
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createLmsSession(userId: number) {
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt: Date.now() + SESSION_MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readSession(value: string | undefined): SessionPayload | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    const userId = Number(parsed.userId);
    if (!Number.isSafeInteger(userId) || parsed.expiresAt <= Date.now()) return null;
    return { userId, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

export async function setLmsSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(LMS_SESSION_COOKIE, createLmsSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearLmsSession() {
  const cookieStore = await cookies();
  cookieStore.set(LMS_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getLmsSessionUser() {
  const cookieStore = await cookies();
  const session = readSession(cookieStore.get(LMS_SESSION_COOKIE)?.value);
  if (!session) return null;

  const result = await queryLms<{ id: number; name: string; email: string; role: LmsRole }>(
    "SELECT id, name, email, role FROM lms_users WHERE id = $1",
    [session.userId],
  );
  return result.rows[0] ?? null;
}