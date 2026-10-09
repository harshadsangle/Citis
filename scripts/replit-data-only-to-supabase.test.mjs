import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";

const guardPath = resolve("scripts/citis-environment-guard.sh");

function validateEnvironment(environment = {}) {
  return spawnSync(
    "bash",
    ["-c", 'source "$1"; validate_data_transfer_environment', "guard-test", guardPath],
    {
      encoding: "utf8",
      env: {
        PATH: process.env.PATH || "/usr/bin:/bin",
        ...environment,
      },
    },
  );
}

test("data-transfer guard rejects staging in normalized case and whitespace variants", () => {
  for (const value of ["Staging", "STAGING", " staging ", "\tStAgInG\n"]) {
    const result = validateEnvironment({ CITIS_ENVIRONMENT: value, NODE_ENV: "development" });
    assert.notEqual(result.status, 0, JSON.stringify(value));
    assert.match(result.stderr, /disabled in staging mode/, JSON.stringify(value));
  }
});

test("data-transfer guard rejects invalid and production modes before external commands", () => {
  for (const environment of [
    { CITIS_ENVIRONMENT: "preview", NODE_ENV: "development" },
    { CITIS_ENVIRONMENT: "production", NODE_ENV: "development" },
    { CITIS_ENVIRONMENT: "development", NODE_ENV: "production" },
    { NODE_ENV: "production" },
  ]) {
    const result = validateEnvironment(environment);
    assert.notEqual(result.status, 0);
  }
});

test("data-transfer guard permits ordinary development mode", () => {
  assert.equal(validateEnvironment({
    CITIS_ENVIRONMENT: " Development ",
    NODE_ENV: "development",
  }).status, 0);
});
