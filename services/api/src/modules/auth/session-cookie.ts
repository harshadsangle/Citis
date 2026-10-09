import { getCitisEnvironment, PRODUCTION_SESSION_COOKIE_NAME, STAGING_SESSION_COOKIE_NAME } from "../../config/runtime-config";

export function getSessionCookieName(environment: NodeJS.ProcessEnv = process.env) {
  return getCitisEnvironment(environment) === "staging"
    ? STAGING_SESSION_COOKIE_NAME
    : PRODUCTION_SESSION_COOKIE_NAME;
}

function cookieScope(environment: NodeJS.ProcessEnv) {
  const mode = getCitisEnvironment(environment);
  const secure = environment.NODE_ENV === "production" || mode === "staging";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    ...(mode === "production" && secure ? { domain: ".citisinfotech.in" } : {}),
    path: "/",
  };
}

export function sessionCookieOptions(expires: Date, environment: NodeJS.ProcessEnv = process.env) {
  return { ...cookieScope(environment), expires };
}

export function clearSessionCookieOptions(environment: NodeJS.ProcessEnv = process.env) {
  return cookieScope(environment);
}
