import assert from "node:assert/strict";
import test from "node:test";
import { shouldLoadLocalEnvironment } from "./local-env-policy.mjs";

test("local environment files load in ordinary development when no database URL is supplied", () => {
  assert.equal(shouldLoadLocalEnvironment({ NODE_ENV: "development" }, "linux"), true);
});

test("an inherited database URL is preserved unless local development is explicit", () => {
  assert.equal(shouldLoadLocalEnvironment({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://runtime.example.test/application",
  }, "linux"), false);
  assert.equal(shouldLoadLocalEnvironment({
    NODE_ENV: "development",
    CITIS_ENVIRONMENT: "development",
    DATABASE_URL: "postgresql://runtime.example.test/application",
  }, "linux"), true);
});

test("Replit development and Windows retain their intended local file overrides", () => {
  assert.equal(shouldLoadLocalEnvironment({
    DATABASE_URL: "postgresql://runtime.example.test/application",
    REPLIT_DEV_DOMAIN: "workspace.example.test",
  }, "linux"), true);
  assert.equal(shouldLoadLocalEnvironment({
    DATABASE_URL: "postgresql://runtime.example.test/application",
  }, "win32"), true);
});

test("production, staging, deployment, and invalid modes never load local files", () => {
  for (const environment of [
    { NODE_ENV: "production", DATABASE_URL: "postgresql://runtime.example.test/application" },
    { CITIS_ENVIRONMENT: "production", DATABASE_URL: "postgresql://runtime.example.test/application" },
    { CITIS_ENVIRONMENT: " Staging ", DATABASE_URL: "postgresql://runtime.example.test/application" },
    { REPLIT_DEPLOYMENT: "1", DATABASE_URL: "postgresql://runtime.example.test/application" },
    { CITIS_ENVIRONMENT: "preview", DATABASE_URL: "postgresql://runtime.example.test/application" },
  ]) {
    assert.equal(shouldLoadLocalEnvironment(environment, "linux"), false);
  }
});
