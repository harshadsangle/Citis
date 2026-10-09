import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveLmsApiOrigin,
  resolvePublicFrontendApiConfiguration,
} from "./staging-api-config";

const stagingEnvironment = {
  CITIS_ENVIRONMENT: "staging",
  LMS_API_ORIGIN: "https://api.citisinfotech.in/api/v1",
  STAGING_API_ORIGIN: "https://api-staging.example.test/api/v1",
  PRODUCTION_API_ORIGIN: "https://api.citisinfotech.in/api/v1",
} as NodeJS.ProcessEnv;

test("staging uses its explicit API origin instead of the generic production origin", () => {
  assert.equal(resolveLmsApiOrigin(stagingEnvironment), "https://api-staging.example.test/api/v1");
});

test("staging fails when its API origin is missing even if the generic production origin exists", () => {
  assert.throws(
    () => resolveLmsApiOrigin({ ...stagingEnvironment, STAGING_API_ORIGIN: undefined }),
    /STAGING_API_ORIGIN is required/,
  );
});

test("staging rejects an API origin identical to production", () => {
  assert.throws(
    () => resolveLmsApiOrigin({
      ...stagingEnvironment,
      STAGING_API_ORIGIN: "https://api.citisinfotech.in/api/v1/",
    }),
    /must be different/,
  );
});

test("staging API origins must use HTTPS and the API path", () => {
  assert.throws(
    () => resolveLmsApiOrigin({ ...stagingEnvironment, STAGING_API_ORIGIN: "http://stage.example.test/api/v1" }),
    /must be an HTTPS API base URL/,
  );
});

test("stage-only API variables require an explicit staging marker", () => {
  assert.throws(
    () => resolveLmsApiOrigin({ ...stagingEnvironment, CITIS_ENVIRONMENT: undefined }),
    /Set CITIS_ENVIRONMENT=staging/,
  );
});

test("staging API variables cannot be ignored under production mode", () => {
  assert.throws(
    () => resolveLmsApiOrigin({ ...stagingEnvironment, CITIS_ENVIRONMENT: "production" }),
    /Set CITIS_ENVIRONMENT=staging/,
  );
});

test("Vercel Preview requires explicit staging mode", () => {
  assert.throws(
    () => resolveLmsApiOrigin({ VERCEL_ENV: "preview", NODE_ENV: "production" }),
    /CITIS_ENVIRONMENT=staging for Vercel Preview/,
  );
});

test("public frontend Preview routes to the explicit staging API, not a generic production URL", () => {
  assert.deepEqual(resolvePublicFrontendApiConfiguration({
    ...stagingEnvironment,
    VERCEL_ENV: "preview",
    NEXT_PUBLIC_API_URL: "https://api.citisinfotech.in/api/v1",
  }), {
    apiOrigin: "https://api-staging.example.test/api/v1",
    environment: "staging",
  });
});

test("Vercel Production rejects staging mode before selecting its API origin", () => {
  assert.throws(
    () => resolvePublicFrontendApiConfiguration({
      ...stagingEnvironment,
      VERCEL_ENV: "production",
      NODE_ENV: "production",
    }),
    /CITIS_ENVIRONMENT=production for Vercel Production/,
  );
});

test("Vercel Production rejects development mode before selecting a local API origin", () => {
  assert.throws(
    () => resolvePublicFrontendApiConfiguration({
      VERCEL_ENV: "production",
      NODE_ENV: "production",
      CITIS_ENVIRONMENT: "development",
    }),
    /CITIS_ENVIRONMENT=production for Vercel Production/,
  );
});

test("public frontend production preserves its existing production API default", () => {
  assert.deepEqual(resolvePublicFrontendApiConfiguration({
    NODE_ENV: "production",
    VERCEL_ENV: "production",
    CITIS_ENVIRONMENT: "production",
  }), {
    apiOrigin: "https://api.citisinfotech.in/api/v1",
    environment: "production",
  });
  assert.deepEqual(resolvePublicFrontendApiConfiguration({
    NODE_ENV: "development",
    VERCEL_ENV: "production",
  }), {
    apiOrigin: "https://api.citisinfotech.in/api/v1",
    environment: "production",
  });
});

test("public frontend staging fails instead of falling back when its API origin is missing", () => {
  assert.throws(
    () => resolvePublicFrontendApiConfiguration({
      VERCEL_ENV: "preview",
      NODE_ENV: "production",
      CITIS_ENVIRONMENT: "staging",
      LMS_API_ORIGIN: "https://api.citisinfotech.in/api/v1",
      NEXT_PUBLIC_API_URL: "https://api.citisinfotech.in/api/v1",
      PRODUCTION_API_ORIGIN: "https://api.citisinfotech.in/api/v1",
    }),
    /STAGING_API_ORIGIN is required/,
  );
});
