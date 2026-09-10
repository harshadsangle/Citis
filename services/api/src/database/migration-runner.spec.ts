import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { Client } from "pg";
import {
  MIGRATION_VERSIONS,
  resolveMigrationRoot,
  runMigrations,
} from "./migrate";

const migrationTest = process.env.DATABASE_URL ? test : test.skip;

function newSchemaName() {
  return `migration_test_${randomBytes(8).toString("hex")}`;
}

async function createSchema() {
  const schema = newSchemaName();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(`CREATE SCHEMA "${schema}"`);
  await client.end();
  return schema;
}

async function connectToSchema(schema: string) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(`SET search_path TO "${schema}", public`);
  return client;
}

async function dropSchema(schema: string) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await client.end();
}

async function withCleanSchema<T>(work: (client: Client, schema: string) => Promise<T>) {
  const schema = await createSchema();
  const client = await connectToSchema(schema);
  try {
    return await work(client, schema);
  } finally {
    await client.end();
    await dropSchema(schema);
  }
}

test("migration runner applies every migration once on a clean database", { skip: !process.env.DATABASE_URL }, async () => {
  const migrationRoot = await resolveMigrationRoot();
  await withCleanSchema(async (client) => {
    const result = await runMigrations(client, migrationRoot, MIGRATION_VERSIONS, () => undefined);
    assert.deepEqual(result.applied, [...MIGRATION_VERSIONS]);
    assert.deepEqual(result.skipped, []);
    assert.deepEqual(result.checksumsBackfilled, []);

    const applied = await client.query<{ version: string }>(
      "SELECT version FROM schema_migrations ORDER BY version",
    );
    const checksums = await client.query<{ rows: string }>(
      "SELECT count(*)::text AS rows FROM schema_migration_checksums",
    );
    assert.deepEqual(applied.rows.map((row) => row.version), [...MIGRATION_VERSIONS]);
    assert.equal(checksums.rows[0]?.rows, String(MIGRATION_VERSIONS.length));
  });
});

test("migration runner skips all already-applied migrations on a rerun", { skip: !process.env.DATABASE_URL }, async () => {
  const migrationRoot = await resolveMigrationRoot();
  await withCleanSchema(async (client) => {
    await runMigrations(client, migrationRoot, MIGRATION_VERSIONS, () => undefined);
    const result = await runMigrations(client, migrationRoot, MIGRATION_VERSIONS, () => undefined);

    assert.deepEqual(result.applied, []);
    assert.deepEqual(result.skipped, [...MIGRATION_VERSIONS]);
    assert.deepEqual(result.checksumsBackfilled, []);
  });
});

test("concurrent migration runners are serialized by the database lock", { skip: !process.env.DATABASE_URL }, async () => {
  const migrationRoot = await resolveMigrationRoot();
  const schema = await createSchema();
  const clients = await Promise.all([connectToSchema(schema), connectToSchema(schema)]);
  try {
    const results = await Promise.all(
      clients.map((client) => runMigrations(client, migrationRoot, MIGRATION_VERSIONS, () => undefined)),
    );
    const appliedCount = results.reduce((total, result) => total + result.applied.length, 0);
    const skippedCount = results.reduce((total, result) => total + result.skipped.length, 0);
    const applied = await clients[0].query<{ version: string }>(
      "SELECT version FROM schema_migrations ORDER BY version",
    );

    assert.equal(appliedCount, MIGRATION_VERSIONS.length);
    assert.equal(skippedCount, MIGRATION_VERSIONS.length);
    assert.deepEqual(applied.rows.map((row) => row.version), [...MIGRATION_VERSIONS]);
  } finally {
    await Promise.all(clients.map((client) => client.end()));
    await dropSchema(schema);
  }
});

test("migration runner detects a changed checksum before applying migrations", { skip: !process.env.DATABASE_URL }, async () => {
  const migrationRoot = await resolveMigrationRoot();
  await withCleanSchema(async (client) => {
    await runMigrations(client, migrationRoot, MIGRATION_VERSIONS, () => undefined);
    await client.query(
      "UPDATE schema_migration_checksums SET checksum = 'tampered' WHERE version = $1",
      [MIGRATION_VERSIONS[0]],
    );

    await assert.rejects(
      runMigrations(client, migrationRoot, MIGRATION_VERSIONS, () => undefined),
      /Migration checksum mismatch for 001_foundation/,
    );
  });
});

test("failed migration rolls back its own changes while preserving earlier migrations", { skip: !process.env.DATABASE_URL }, async () => {
  const schema = await createSchema();
  const migrationRoot = await mkdtemp(resolve(tmpdir(), "citis-migrations-"));
  const clients = await connectToSchema(schema);
  try {
    await writeFile(
      resolve(migrationRoot, "001_partial.sql"),
      `CREATE TABLE migration_partial_probe (id integer);
       INSERT INTO migration_partial_probe (id) VALUES (1);
       INSERT INTO schema_migrations (version) VALUES ('001_partial') ON CONFLICT (version) DO NOTHING;`,
    );
    await writeFile(
      resolve(migrationRoot, "002_failure.sql"),
      `CREATE TABLE migration_failed_probe (id integer);
       SELECT 1 / 0;
       INSERT INTO schema_migrations (version) VALUES ('002_failure') ON CONFLICT (version) DO NOTHING;`,
    );

    await assert.rejects(
      runMigrations(clients, migrationRoot, ["001_partial", "002_failure"], () => undefined),
      /Migration 002_failure failed/,
    );

    const state = await clients.query<{ version: string; partial_relation: string | null; failed_relation: string | null }>(
      `SELECT
         (SELECT string_agg(version, ',') FROM schema_migrations) AS version,
         to_regclass('migration_partial_probe')::text AS partial_relation,
         to_regclass('migration_failed_probe')::text AS failed_relation`,
    );
    assert.equal(state.rows[0]?.version, "001_partial");
    assert.match(state.rows[0]?.partial_relation ?? "", /migration_partial_probe/);
    assert.equal(state.rows[0]?.failed_relation, null);
  } finally {
    await clients.end();
    await dropSchema(schema);
    await rm(migrationRoot, { recursive: true, force: true });
  }
});