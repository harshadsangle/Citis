import assert from "node:assert/strict";
import test from "node:test";
import { resolveLmsApiOrigin } from "./staging-api-config";

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
