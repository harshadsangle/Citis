const DEPLOYMENT_ENVIRONMENTS = new Set(["development", "staging", "production"]);

export function shouldLoadLocalEnvironment(environment = process.env, platform = process.platform) {
  const configuredEnvironment = environment.CITIS_ENVIRONMENT?.trim().toLowerCase() || "";
  if (configuredEnvironment && !DEPLOYMENT_ENVIRONMENTS.has(configuredEnvironment)) return false;

  if (
    environment.NODE_ENV === "production" ||
    environment.REPLIT_DEPLOYMENT === "1" ||
    configuredEnvironment === "staging" ||
    configuredEnvironment === "production"
  ) {
    return false;
  }

  const hasSuppliedDatabaseUrl = Boolean(environment.DATABASE_URL?.trim());
  if (!hasSuppliedDatabaseUrl) return true;

  const explicitlySelectedDevelopment = configuredEnvironment === "development";
  const localDevelopmentRuntime = platform === "win32" || Boolean(environment.REPLIT_DEV_DOMAIN);
  return explicitlySelectedDevelopment || localDevelopmentRuntime;
}
