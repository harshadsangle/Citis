import assert from "node:assert/strict";
import test from "node:test";
import {
  clearSessionCookieOptions,
  getSessionCookieName,
  sessionCookieOptions,
} from "./session-cookie";

test("staging uses a separate secure host-only cookie", () => {
  const environment = { NODE_ENV: "production", CITIS_ENVIRONMENT: "staging" } as NodeJS.ProcessEnv;
  assert.equal(getSessionCookieName(environment), "citis_staging_session");
  assert.deepEqual(sessionCookieOptions(new Date("2030-01-01T00:00:00.000Z"), environment), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date("2030-01-01T00:00:00.000Z"),
  });
  assert.deepEqual(clearSessionCookieOptions(environment), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
});

test("production keeps its existing cookie name and parent-domain scope", () => {
  const environment = { NODE_ENV: "production" } as NodeJS.ProcessEnv;
  assert.equal(getSessionCookieName(environment), "citis_session");
  assert.deepEqual(clearSessionCookieOptions(environment), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    domain: ".citisinfotech.in",
    path: "/",
  });
});
