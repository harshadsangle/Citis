const LOCAL_API_ORIGIN = "http://127.0.0.1:4000/api/v1";
const DEPLOYMENT_ENVIRONMENTS = new Set(["development", "staging", "production"]);

function normalizedApiOrigin(value: string | undefined, key: string, requireHttps: boolean) {
  if (!value?.trim()) throw new Error(`${key} is required for the selected deployment environment.`);

  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(`${key} must be a valid API base URL ending in /api/v1.`);
  }

  if (
    !url.hostname ||
    !["http:", "https:"].includes(url.protocol) ||
    (requireHttps && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    url.pathname.replace(/\/+$/, "") !== "/api/v1" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${key} must be an HTTPS API base URL ending in /api/v1 without credentials or extra URL parts.`);
  }

  return `${url.origin}/api/v1`;
}

export function resolveLmsApiOrigin(environment: NodeJS.ProcessEnv = process.env) {
  const configuredEnvironment = environment.CITIS_ENVIRONMENT?.trim().toLowerCase();
  if (configuredEnvironment && !DEPLOYMENT_ENVIRONMENTS.has(configuredEnvironment)) {
    throw new Error("CITIS_ENVIRONMENT must be development, staging, or production.");
  }

  if (configuredEnvironment === "staging") {
    const stagingOrigin = normalizedApiOrigin(environment.STAGING_API_ORIGIN, "STAGING_API_ORIGIN", true);
    const productionOrigin = normalizedApiOrigin(environment.PRODUCTION_API_ORIGIN, "PRODUCTION_API_ORIGIN", true);
    if (stagingOrigin === productionOrigin) {
      throw new Error("STAGING_API_ORIGIN must be different from PRODUCTION_API_ORIGIN.");
    }
    return stagingOrigin;
  }

  if (!configuredEnvironment && (environment.STAGING_API_ORIGIN || environment.PRODUCTION_API_ORIGIN)) {
    throw new Error("Set CITIS_ENVIRONMENT=staging when using staging API origin variables.");
  }

  return normalizedApiOrigin(environment.LMS_API_ORIGIN || LOCAL_API_ORIGIN, "LMS_API_ORIGIN", false);
}
