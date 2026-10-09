const DEPLOYMENT_ENVIRONMENTS = new Set(["development", "staging", "production"]);

function normalized(value) {
  return value?.trim().toLowerCase() || "";
}

export function validateCourseApprovalRepairEnvironment(environment = process.env) {
  const configuredEnvironment = normalized(environment.CITIS_ENVIRONMENT);
  const nodeEnvironment = normalized(environment.NODE_ENV);

  if (configuredEnvironment === "production") {
    throw new Error("Course-approval repair is disabled in production.");
  }
  if (environment.REPLIT_DEPLOYMENT?.trim()) {
    throw new Error("Course-approval repair is disabled in deployed runtimes.");
  }
  if (!DEPLOYMENT_ENVIRONMENTS.has(configuredEnvironment)) {
    throw new Error("CITIS_ENVIRONMENT must be explicitly set to development or staging.");
  }
  if (
    (configuredEnvironment === "development" && nodeEnvironment !== "development") ||
    (configuredEnvironment === "staging" && nodeEnvironment !== "production")
  ) {
    throw new Error("CITIS_ENVIRONMENT and NODE_ENV do not match a supported repair runtime.");
  }

  return configuredEnvironment;
}

export async function runCourseApprovalRepairInSafeEnvironment(environment, operation) {
  validateCourseApprovalRepairEnvironment(environment);
  return operation();
}
