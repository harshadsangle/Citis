import assert from "node:assert/strict";
import test from "node:test";
import { resolveApiBaseUrl, resolveApiRequestBaseUrl } from "./api-url";

test("staging API clients require an explicit API origin instead of a production fallback", () => {
  assert.throws(
    () => resolveApiBaseUrl(undefined, " Staging ", "production"),
    /NEXT_PUBLIC_API_URL must be configured for staging/,
  );
});

test("production client keeps its production default outside staging", () => {
  assert.equal(
    resolveApiBaseUrl(undefined, "production", "production"),
    "https://api.citisinfotech.in/api/v1",
  );
});

test("staging browser requests use the same-origin proxy and server requests use the staging API", () => {
  const stagingApi = "https://api-staging.example.test/api/v1";
  assert.equal(resolveApiRequestBaseUrl(stagingApi, "staging", "production", true), "/api/v1");
  assert.equal(resolveApiRequestBaseUrl(stagingApi, "staging", "production", false), stagingApi);
});

test("staging browser requests still fail closed when their configured API origin is absent", () => {
  assert.throws(() => {
    const apiUrl = resolveApiBaseUrl(undefined, "staging", "production");
    return resolveApiRequestBaseUrl(apiUrl, "staging", "production", true);
  }, /NEXT_PUBLIC_API_URL must be configured for staging/);
});
