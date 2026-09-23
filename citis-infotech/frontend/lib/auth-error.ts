import { ApiError } from "@/lib/api";

export function loginErrorMessage(error: unknown, stage: string) {
  if (error instanceof ApiError && stage === "login" && error.status === 401) {
    return "Incorrect email or password.";
  }
  if (error instanceof ApiError && stage === "auth/me") {
    return `Sign-in succeeded, but session validation failed (HTTP ${error.status}). Please try again.`;
  }
  if (error instanceof ApiError && error.message === `Request failed with status ${error.status}`) {
    return `Sign-in request failed (HTTP ${error.status}). Please try again.`;
  }
  return error instanceof Error ? error.message : "Sign in failed. Check your details and try again.";
}