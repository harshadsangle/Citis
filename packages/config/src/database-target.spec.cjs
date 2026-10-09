const assert = require("node:assert/strict");
const test = require("node:test");
const {
  getDatabaseTarget,
  resolveDatabaseConnectionString,
  resolveIntegrationTestDatabaseConnectionString,
} = require("./database-target.cjs");

const productionUrl = "postgresql://prod-user:prod-password@prod-db.example.test:5432/citis_prod";
const stagingUrl = "postgresql://stage-user:stage-password@stage-db.example.test:5432/citis_stage";
const productionTarget = "postgresql://prod-db.example.test:5432/citis_prod";

test("staging selects its explicit database and ignores a distinct generic production URL", () => {
  assert.equal(resolveDatabaseConnectionString({
    CITIS_ENVIRONMENT: "staging",
    STAGING_DATABASE_URL: stagingUrl,
    PRODUCTION_DATABASE_TARGET: productionTarget,
    DATABASE_URL: productionUrl,
  }), stagingUrl);
});

test("staging fails closed when its explicit database URL is missing", () => {
  assert.throws(() => resolveDatabaseConnectionString({
    CITIS_ENVIRONMENT: "staging",
    PRODUCTION_DATABASE_TARGET: productionTarget,
    DATABASE_URL: productionUrl,
  }), /STAGING_DATABASE_URL is required/);
});

test("staging rejects a database target matching the configured production target", () => {
  assert.throws(() => resolveDatabaseConnectionString({
    CITIS_ENVIRONMENT: "staging",
    STAGING_DATABASE_URL: "postgres://stage-user:other-password@prod-db.example.test/citis_prod",
    PRODUCTION_DATABASE_TARGET: productionTarget,
  }), /configured production database target/);
});

test("staging rejects its database when it matches generic DATABASE_URL", () => {
  assert.throws(() => resolveDatabaseConnectionString({
    CITIS_ENVIRONMENT: "staging",
    STAGING_DATABASE_URL: stagingUrl,
    PRODUCTION_DATABASE_TARGET: productionTarget,
    DATABASE_URL: stagingUrl,
  }), /same database target/);
});

test("staging requires a credential-free production database fingerprint", () => {
  assert.throws(() => resolveDatabaseConnectionString({
    CITIS_ENVIRONMENT: "staging",
    STAGING_DATABASE_URL: stagingUrl,
    PRODUCTION_DATABASE_TARGET: "postgresql://prod-user:secret@prod-db.example.test/citis_prod",
  }), /without credentials/);
});

test("non-staging mode keeps the existing DATABASE_URL behavior", () => {
  assert.equal(resolveDatabaseConnectionString({
    CITIS_ENVIRONMENT: "production",
    DATABASE_URL: productionUrl,
  }), productionUrl);
});

test("database target inspection returns no credentials", () => {
  assert.deepEqual(getDatabaseTarget(stagingUrl), {
    host: "stage-db.example.test",
    port: "5432",
    database: "citis_stage",
  });
});

test("integration tests never select generic DATABASE_URL implicitly", () => {
  assert.equal(resolveIntegrationTestDatabaseConnectionString({
    NODE_ENV: "development",
    DATABASE_URL: productionUrl,
  }), undefined);
});

test("production database integration tests are disabled even with a test URL", () => {
  assert.equal(resolveIntegrationTestDatabaseConnectionString({
    NODE_ENV: "production",
    CITIS_DB_TEST_URL: stagingUrl,
  }), undefined);
});

test("staging integration test URLs are checked against production", () => {
  assert.throws(() => resolveIntegrationTestDatabaseConnectionString({
    NODE_ENV: "production",
    CITIS_ENVIRONMENT: "staging",
    CITIS_DB_TEST_URL: productionUrl,
    PRODUCTION_DATABASE_TARGET: productionTarget,
  }), /configured production database target/);
});
