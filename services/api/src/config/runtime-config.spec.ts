import assert from "node:assert/strict";
import test from "node:test";
import {
  assertDemoSeedingAllowed,
  getDemoSeedPassword,
  getSessionSecret,
  resolveApiRuntimeConfiguration,
} from "./runtime-config";

const stagingEnvironment = {
  NODE_ENV: "production",
  CITIS_ENVIRONMENT: "staging",
  STAGING_DATABASE_URL: "postgresql://stage-user:stage-password@stage-db.example.test:5432/citis_stage",
  PRODUCTION_DATABASE_TARGET: "postgresql://prod-db.example.test:5432/citis_prod",
  SESSION_SECRET: "production-session-secret-for-test-only",
  STAGING_SESSION_SECRET: "staging-session-secret-for-test-only-32-bytes",
  WEB_ORIGIN: "https://www.citisinfotech.in",
  STAGING_WEB_ORIGIN: "https://lms-staging.example.test",
  PRODUCTION_WEB_ORIGIN: "https://www.citisinfotech.in,https://lms.citisinfotech.in",
} as NodeJS.ProcessEnv;

test("staging configuration returns only the staging database and CORS origins", () => {
  const configuration = resolveApiRuntimeConfiguration({
    ...stagingEnvironment,
    DATABASE_URL: "postgresql://prod-user:prod-password@prod-db.example.test:5432/citis_prod",
  });
  assert.equal(configuration.environment, "staging");
  assert.equal(configuration.databaseUrl, stagingEnvironment.STAGING_DATABASE_URL);
  assert.deepEqual(configuration.allowedOrigins, ["https://lms-staging.example.test"]);
  assert.equal(configuration.sessionCookieName, "citis_staging_session");
  assert.equal(configuration.sessionSecret, stagingEnvironment.STAGING_SESSION_SECRET);
});

test("staging fails when it lacks a staging URL even if production DATABASE_URL exists", () => {
  const { STAGING_DATABASE_URL: _ignored, ...environment } = stagingEnvironment;
  assert.throws(() => resolveApiRuntimeConfiguration({
    ...environment,
    DATABASE_URL: "postgresql://prod-user:prod-password@prod-db.example.test:5432/citis_prod",
  }), /STAGING_DATABASE_URL is required/);
});

test("staging must run with production runtime semantics", () => {
  assert.throws(() => resolveApiRuntimeConfiguration({
    ...stagingEnvironment,
    NODE_ENV: "development",
  }), /NODE_ENV=production/);
});

test("staging requires an independent session secret", () => {
  assert.throws(() => resolveApiRuntimeConfiguration({
    ...stagingEnvironment,
    STAGING_SESSION_SECRET: stagingEnvironment.SESSION_SECRET,
  }), /different from SESSION_SECRET/);
});

test("staging CORS cannot include a production portal origin", () => {
  assert.throws(() => resolveApiRuntimeConfiguration({
    ...stagingEnvironment,
    STAGING_WEB_ORIGIN: "https://lms.citisinfotech.in",
  }), /must not include a production portal origin/);
});

test("production continues to use its current WEB_ORIGIN and session secret", () => {
  const configuration = resolveApiRuntimeConfiguration({
    NODE_ENV: "production",
    WEB_ORIGIN: "https://www.citisinfotech.in",
    SESSION_SECRET: "production-session-secret",
  });
  assert.equal(configuration.environment, "production");
  assert.deepEqual(configuration.allowedOrigins, ["https://www.citisinfotech.in"]);
  assert.equal(configuration.sessionCookieName, "citis_session");
});

test("demo seeds select separate staging passwords and refuse production", () => {
  assert.equal(getDemoSeedPassword("DEMO_LEARNER_PASSWORD", {
    ...stagingEnvironment,
    DEMO_LEARNER_PASSWORD: "production-demo-password",
    STAGING_DEMO_LEARNER_PASSWORD: "staging-demo-password",
  }), "staging-demo-password");
  assert.throws(() => getDemoSeedPassword("DEMO_LEARNER_PASSWORD", {
    ...stagingEnvironment,
    STAGING_DEMO_LEARNER_PASSWORD: "production-demo-password",
    DEMO_LEARNER_PASSWORD: "production-demo-password",
  }), /must be different/);
  assert.throws(() => assertDemoSeedingAllowed({
    NODE_ENV: "production",
    CITIS_ENVIRONMENT: "production",
  }), /disabled in production/);
});

test("staging seed password does not silently use a production password", () => {
  assert.throws(() => getDemoSeedPassword("DEMO_ADMIN_PASSWORD", {
    ...stagingEnvironment,
    DEMO_ADMIN_PASSWORD: "production-admin-password",
  }), /STAGING_DEMO_ADMIN_PASSWORD is required/);
});

test("staging mode is not inferred from production NODE_ENV alone", () => {
  assert.equal(getSessionSecret({
    NODE_ENV: "production",
    SESSION_SECRET: "production-session-secret",
  }), "production-session-secret");
});

test("staging-only API configuration cannot be ignored under production mode", () => {
  assert.throws(() => resolveApiRuntimeConfiguration({
    NODE_ENV: "production",
    CITIS_ENVIRONMENT: "production",
    STAGING_DATABASE_URL: stagingEnvironment.STAGING_DATABASE_URL,
    PRODUCTION_DATABASE_TARGET: stagingEnvironment.PRODUCTION_DATABASE_TARGET,
    SESSION_SECRET: "production-session-secret",
  }), /CITIS_ENVIRONMENT=staging/);
});
