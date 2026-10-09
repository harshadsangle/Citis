const configuredEnvironment = process.env.CITIS_ENVIRONMENT?.trim().toLowerCase();
if (configuredEnvironment && configuredEnvironment !== "staging") {
  throw new Error("The staging API launcher cannot be used with a non-staging CITIS_ENVIRONMENT.");
}

process.env.CITIS_ENVIRONMENT = "staging";
process.env.NODE_ENV = "production";

await import("../services/api/dist/main.js");
