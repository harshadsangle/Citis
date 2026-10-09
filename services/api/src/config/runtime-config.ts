import { createRequire } from "node:module";
import { resolve } from "node:path";
import { normalizeOrigin } from "../common/cors-origin";

export type CitisEnvironment = "development" | "staging" | "production";

export const STAGING_SESSION_COOKIE_NAME = "citis_staging_session";
export const PRODUCTION_SESSION_COOKIE_NAME = "citis_session";

const productionOrigins = new Set([
  "https://citis-institution-admin-pbhs.vercel.app",
  "https://citis-institution-admin.vercel.app",
  "https://www.citisinfotech.in",
  "https://lms.citisinfotech.in",
]);

const requireFromRepositoryRoot = createRequire(resolve(__dirname, "../../../../package.json"));
const databaseTarget = requireFromRepositoryRoot("./packages/config/src/database-target.cjs") as {
  getDatabaseTarget(connectionString: string): { host: string; port: string; database: string };
  resolveDatabaseConnectionString(environment?: NodeJS.ProcessEnv): string;
};

export interface ApiRuntimeConfiguration {
  environment: CitisEnvironment;
  allowedOrigins: string[];
  sessionCookieName: string;
  databaseUrl?: string;
  sessionSecret?: string;
}

export function getCitisEnvironment(environment: NodeJS.ProcessEnv = process.env): CitisEnvironment {
  const configured = environment.CITIS_ENVIRONMENT?.trim().toLowerCase();
  if (configured) {
    if (configured === "development" || configured === "staging" || configured === "production") {
      return configured;
    }
    throw new Error("CITIS_ENVIRONMENT must be development, staging, or production.");
  }
  return environment.NODE_ENV === "production" ? "production" : "development";
}

function parseHttpsOrigins(value: string | undefined, key: string) {
  if (!value?.trim()) throw new Error(`${key} is required for staging.`);
  const parts = value.split(",").map((part) => part.trim());
  if (parts.some((part) => !part)) throw new Error(`${key} must be a comma-separated list of HTTPS origins.`);

  return [...new Set(parts.map((part) => {
    let url: URL;
    try {
      url = new URL(part);
    } catch {
      throw new Error(`${key} must contain valid HTTPS origins.`);
    }
    if (
      url.protocol !== "https:" ||
      !url.hostname ||
      url.username ||
      url.password ||
      (url.pathname !== "/" && url.pathname !== "") ||
      url.search ||
      url.hash
    ) {
      throw new Error(`${key} must contain HTTPS origins without credentials, paths, queries, or fragments.`);
    }
    return normalizeOrigin(url.origin);
  }))];
}

export function getSessionSecret(environment: NodeJS.ProcessEnv = process.env) {
  if (getCitisEnvironment(environment) !== "staging") {
    return environment.SESSION_SECRET || undefined;
  }

  const stagingSecret = environment.STAGING_SESSION_SECRET;
  if (!stagingSecret?.trim() || Buffer.byteLength(stagingSecret, "utf8") < 32) {
    throw new Error("STAGING_SESSION_SECRET must contain at least 32 bytes.");
  }
  if (environment.SESSION_SECRET && stagingSecret === environment.SESSION_SECRET) {
    throw new Error("STAGING_SESSION_SECRET must be different from SESSION_SECRET.");
  }
  return stagingSecret;
}

export function resolveApiRuntimeConfiguration(environment: NodeJS.ProcessEnv = process.env): ApiRuntimeConfiguration {
  const citisEnvironment = getCitisEnvironment(environment);
  if (citisEnvironment !== "staging") {
    const allowedOrigins = (environment.WEB_ORIGIN || "")
      .split(",")
      .map(normalizeOrigin)
      .filter(Boolean);
    if (citisEnvironment === "production" && allowedOrigins.length === 0) {
      throw new Error("WEB_ORIGIN must be configured in production.");
    }
    return {
      environment: citisEnvironment,
      allowedOrigins,
      sessionCookieName: PRODUCTION_SESSION_COOKIE_NAME,
      sessionSecret: environment.SESSION_SECRET || undefined,
    };
  }

  if (environment.NODE_ENV !== "production") {
    throw new Error("Staging must run with NODE_ENV=production.");
  }

  const databaseUrl = databaseTarget.resolveDatabaseConnectionString(environment);
  const sessionSecret = getSessionSecret(environment);
  const stagingOrigins = parseHttpsOrigins(environment.STAGING_WEB_ORIGIN, "STAGING_WEB_ORIGIN");
  const configuredProductionOrigins = parseHttpsOrigins(
    environment.PRODUCTION_WEB_ORIGIN,
    "PRODUCTION_WEB_ORIGIN",
  );
  const forbiddenOrigins = new Set([...productionOrigins, ...configuredProductionOrigins]);
  if (stagingOrigins.some((origin) => forbiddenOrigins.has(origin))) {
    throw new Error("STAGING_WEB_ORIGIN must not include a production portal origin.");
  }

  const stagingDatabaseTarget = databaseTarget.getDatabaseTarget(databaseUrl);
  return {
    environment: citisEnvironment,
    allowedOrigins: stagingOrigins,
    sessionCookieName: STAGING_SESSION_COOKIE_NAME,
    databaseUrl,
    sessionSecret,
  };
}

export function resolveDatabaseConnectionString(environment: NodeJS.ProcessEnv = process.env) {
  return databaseTarget.resolveDatabaseConnectionString(environment);
}

export function getDemoSeedPassword(environmentKey: string, environment: NodeJS.ProcessEnv = process.env) {
  if (getCitisEnvironment(environment) !== "staging") {
    return environment[environmentKey];
  }

  const stagingKey = `STAGING_${environmentKey}`;
  const stagingPassword = environment[stagingKey];
  if (!stagingPassword) throw new Error(`${stagingKey} is required to seed a staging demo account.`);
  const existingPassword = environment[environmentKey];
  if (existingPassword && stagingPassword === existingPassword) {
    throw new Error(`${stagingKey} must be different from ${environmentKey}.`);
  }
  return stagingPassword;
}

export function assertDemoSeedingAllowed(environment: NodeJS.ProcessEnv = process.env) {
  const citisEnvironment = getCitisEnvironment(environment);
  if (citisEnvironment === "production") {
    throw new Error("Demo seed commands are disabled in production.");
  }
  return citisEnvironment;
}
