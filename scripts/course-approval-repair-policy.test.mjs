import assert from "node:assert/strict";
import test from "node:test";
import {
  runCourseApprovalRepairInSafeEnvironment,
  validateCourseApprovalRepairEnvironment,
} from "./course-approval-repair-policy.mjs";

test("production repair mode is rejected before database resolution or repair", async () => {
  for (const environment of [
    { CITIS_ENVIRONMENT: "production", NODE_ENV: "development" },
    { CITIS_ENVIRONMENT: "Production", NODE_ENV: "production" },
    { CITIS_ENVIRONMENT: "production" },
  ]) {
    let databaseResolutionReached = false;
    let repairReached = false;
    await assert.rejects(
      runCourseApprovalRepairInSafeEnvironment(environment, async () => {
        databaseResolutionReached = true;
        repairReached = true;
      }),
      /disabled in production/,
    );
    assert.equal(databaseResolutionReached, false);
    assert.equal(repairReached, false);
  }
});

test("ambiguous, invalid, mismatched, and deployed runtimes are rejected before repair", async () => {
  for (const environment of [
    {},
    { CITIS_ENVIRONMENT: "development" },
    { NODE_ENV: "development" },
    { CITIS_ENVIRONMENT: "preview", NODE_ENV: "development" },
    { CITIS_ENVIRONMENT: "development", NODE_ENV: "production" },
    { CITIS_ENVIRONMENT: "staging", NODE_ENV: "development" },
    { CITIS_ENVIRONMENT: "staging", NODE_ENV: "production", REPLIT_DEPLOYMENT: "1" },
  ]) {
    let repairReached = false;
    await assert.rejects(
      runCourseApprovalRepairInSafeEnvironment(environment, async () => {
        repairReached = true;
      }),
    );
    assert.equal(repairReached, false);
  }
});

test("only matching explicit development or staging modes reach the operation", async () => {
  assert.equal(validateCourseApprovalRepairEnvironment({
    CITIS_ENVIRONMENT: "development",
    NODE_ENV: "development",
  }), "development");
  assert.equal(validateCourseApprovalRepairEnvironment({
    CITIS_ENVIRONMENT: " Staging ",
    NODE_ENV: " Production ",
  }), "staging");
});
