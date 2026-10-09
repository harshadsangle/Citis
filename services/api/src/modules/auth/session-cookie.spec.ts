import assert from "node:assert/strict";
import test from "node:test";
import type { ContextRequest } from "../../common/request-context";
import { AuthGuard } from "./auth.guard";
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

test("the staging auth guard ignores a production session cookie", () => {
  const previousEnvironment = process.env.CITIS_ENVIRONMENT;
  const previousNodeEnvironment = process.env.NODE_ENV;
  process.env.CITIS_ENVIRONMENT = "staging";
  process.env.NODE_ENV = "production";
  try {
    const request = {
      header: (name: string) => name === "cookie"
        ? "citis_session=production-token; citis_staging_session=staging-token"
        : undefined,
    } as ContextRequest;
    assert.equal(AuthGuard.tokenFrom(request), "staging-token");
    const productionOnlyRequest = {
      header: (name: string) => name === "cookie" ? "citis_session=production-token" : undefined,
    } as ContextRequest;
    assert.equal(AuthGuard.tokenFrom(productionOnlyRequest), "");
  } finally {
    if (previousEnvironment === undefined) delete process.env.CITIS_ENVIRONMENT;
    else process.env.CITIS_ENVIRONMENT = previousEnvironment;
    if (previousNodeEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnvironment;
  }
});
