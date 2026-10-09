const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);
const DEPLOYMENT_ENVIRONMENTS = new Set(["development", "staging", "production"]);

function requiredValue(environment, key) {
  const value = environment[key]?.trim();
  if (!value) throw new Error(`${key} is required for the selected deployment environment.`);
  return value;
}

function parseDatabaseTarget(value, key, { credentialFree = false } = {}) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${key} must be a valid PostgreSQL connection URL.`);
  }

  if (!POSTGRES_PROTOCOLS.has(url.protocol) || !url.hostname) {
    throw new Error(`${key} must be a valid PostgreSQL connection URL.`);
  }

  let database;
  try {
    database = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  } catch {
    throw new Error(`${key} must contain a valid database name.`);
  }
  if (!database) throw new Error(`${key} must contain a database name.`);

  if (credentialFree && (url.username || url.password || url.search || url.hash)) {
    throw new Error(`${key} must identify a database target without credentials or query parameters.`);
  }

  const host = url.hostname.toLowerCase();
  const port = url.port || "5432";
  return { host, port, database, identity: `${host}:${port}/${database}` };
}

function getDatabaseTarget(connectionString) {
  const target = parseDatabaseTarget(connectionString, "database connection URL");
  return { host: target.host, port: target.port, database: target.database };
}

function resolveDatabaseConnectionString(environment = process.env) {
  const configuredEnvironment = environment.CITIS_ENVIRONMENT?.trim().toLowerCase();
  if (configuredEnvironment && !DEPLOYMENT_ENVIRONMENTS.has(configuredEnvironment)) {
    throw new Error("CITIS_ENVIRONMENT must be development, staging, or production.");
  }

  if (configuredEnvironment === "staging") {
    const stagingUrl = requiredValue(environment, "STAGING_DATABASE_URL");
    const stagingTarget = parseDatabaseTarget(stagingUrl, "STAGING_DATABASE_URL");
    const productionTargetUrl = requiredValue(environment, "PRODUCTION_DATABASE_TARGET");
    const productionTarget = parseDatabaseTarget(productionTargetUrl, "PRODUCTION_DATABASE_TARGET", {
      credentialFree: true,
    });

    if (stagingTarget.identity === productionTarget.identity) {
      throw new Error("STAGING_DATABASE_URL resolves to the configured production database target.");
    }

    const genericDatabaseUrl = environment.DATABASE_URL?.trim();
    if (genericDatabaseUrl) {
      const genericTarget = parseDatabaseTarget(genericDatabaseUrl, "DATABASE_URL");
      if (stagingTarget.identity === genericTarget.identity) {
        throw new Error("STAGING_DATABASE_URL and DATABASE_URL resolve to the same database target.");
      }
    }

    return stagingUrl;
  }

  const databaseUrl = environment.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL is required to connect to the database.");
  return databaseUrl;
}

module.exports = { getDatabaseTarget, resolveDatabaseConnectionString };
