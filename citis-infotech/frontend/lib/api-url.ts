const PRODUCTION_API_ORIGIN = "https://api.citisinfotech.in/api/v1";

function isStagingEnvironment(environment: string | undefined) {
  return environment?.trim().toLowerCase() === "staging";
}

export function resolveApiBaseUrl(
  configuredApiUrl: string | undefined,
  configuredEnvironment: string | undefined,
  nodeEnvironment: string | undefined,
) {
  const apiUrl = configuredApiUrl?.trim();
  if (isStagingEnvironment(configuredEnvironment) && !apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured for staging.");
  }

  return apiUrl || (nodeEnvironment === "production" ? PRODUCTION_API_ORIGIN : "/api/v1");
}

export function resolveApiRequestBaseUrl(
  apiUrl: string,
  configuredEnvironment: string | undefined,
  nodeEnvironment: string | undefined,
  isBrowser: boolean,
) {
  const staging = isStagingEnvironment(configuredEnvironment);
  if (isBrowser && (staging || nodeEnvironment === "development")) {
    return "/api/v1";
  }
  return apiUrl;
}
