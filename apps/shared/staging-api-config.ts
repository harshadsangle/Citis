const LOCAL_API_ORIGIN = "http://127.0.0.1:4000/api/v1";
const PRODUCTION_API_ORIGIN = "https://api.citisinfotech.in/api/v1";
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

function configuredEnvironment(environment: NodeJS.ProcessEnv) {
  const configured = environment.CITIS_ENVIRONMENT?.trim().toLowerCase();
  if (configured && !DEPLOYMENT_ENVIRONMENTS.has(configured)) {
    throw new Error("CITIS_ENVIRONMENT must be development, staging, or production.");
  }
  return configured;
}

export function resolveLmsApiOrigin(environment: NodeJS.ProcessEnv = process.env) {
  const configured = configuredEnvironment(environment);
  const vercelEnvironment = environment.VERCEL_ENV?.trim().toLowerCase();
  if (vercelEnvironment === "preview" && configured !== "staging") {
    throw new Error("Set CITIS_ENVIRONMENT=staging for Vercel Preview deployments.");
  }
  if (
    vercelEnvironment === "production" &&
    (configured === "staging" || configured === "development")
  ) {
    throw new Error("Set CITIS_ENVIRONMENT=production for Vercel Production deployments.");
  }

  if (
    configured !== "staging" &&
    (environment.STAGING_API_ORIGIN || environment.PRODUCTION_API_ORIGIN)
  ) {
    throw new Error("Set CITIS_ENVIRONMENT=staging when staging API origin variables are present.");
  }

  if (configured === "staging") {
    const stagingOrigin = normalizedApiOrigin(environment.STAGING_API_ORIGIN, "STAGING_API_ORIGIN", true);
    const productionOrigin = normalizedApiOrigin(environment.PRODUCTION_API_ORIGIN, "PRODUCTION_API_ORIGIN", true);
    if (stagingOrigin === productionOrigin) {
      throw new Error("STAGING_API_ORIGIN must be different from PRODUCTION_API_ORIGIN.");
    }
    return stagingOrigin;
  }

  return normalizedApiOrigin(environment.LMS_API_ORIGIN || LOCAL_API_ORIGIN, "LMS_API_ORIGIN", false);
}

export function resolvePublicFrontendApiConfiguration(environment: NodeJS.ProcessEnv = process.env) {
  const configured = configuredEnvironment(environment);
  const vercelEnvironment = environment.VERCEL_ENV?.trim().toLowerCase();
  const deploymentEnvironment = configured
    || (vercelEnvironment === "production" || environment.NODE_ENV === "production"
      ? "production"
      : "development");

  if (configured === "staging") {
    return {
      apiOrigin: resolveLmsApiOrigin(environment),
      environment: deploymentEnvironment,
    };
  }

  // Preserve the public app's existing production URL and NEXT_PUBLIC_API_URL
  // override, while routing all its API paths through the same validated base.
  const apiOrigin = resolveLmsApiOrigin({
    ...environment,
    LMS_API_ORIGIN:
      environment.NEXT_PUBLIC_API_URL?.trim()
      || environment.LMS_API_ORIGIN?.trim()
      || (deploymentEnvironment === "production" ? PRODUCTION_API_ORIGIN : undefined),
  });

  return { apiOrigin, environment: deploymentEnvironment };
}
