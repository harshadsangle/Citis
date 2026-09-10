import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Client } from "pg";
import {
  MIGRATION_VERSIONS,
  resolveMigrationRoot,
  runMigrations,
} from "./migrate";

function newSchemaName() {
  return `tenant_parent_test_${randomUUID().replaceAll("-", "")}`;
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

async function assertForeignKeyViolation(work: () => Promise<unknown>, constraint: string) {
  await assert.rejects(work, (error: unknown) => {
    const databaseError = error as { code?: string; constraint?: string };
    assert.equal(databaseError.code, "23503");
    assert.equal(databaseError.constraint, constraint);
    return true;
  });
}

test("database rejects cross-tenant and wrong-parent LMS hierarchy rows", { skip: !process.env.DATABASE_URL }, async () => {
  const migrationRoot = await resolveMigrationRoot();
  const schema = await createSchema();
  const client = await connectToSchema(schema);
  try {
    await runMigrations(client, migrationRoot, MIGRATION_VERSIONS, () => undefined);

    const tenantA = randomUUID();
    const tenantB = randomUUID();
    const institutionA = randomUUID();
    const institutionB = randomUUID();
    const programmeA = randomUUID();
    const programmeB = randomUUID();
    const courseA = randomUUID();
    const moduleA = randomUUID();
    const lessonA = randomUUID();

    await client.query(
      `INSERT INTO tenants (id, name, slug) VALUES
       ($1, 'Tenant A', $3),
       ($2, 'Tenant B', $4)`,
      [tenantA, tenantB, `tenant-a-${tenantA}`, `tenant-b-${tenantB}`],
    );
    await client.query(
      `INSERT INTO institutions (id, tenant_id, name, slug) VALUES
       ($1, $3, 'Institution A', $5),
       ($2, $4, 'Institution B', $6)`,
      [institutionA, institutionB, tenantA, tenantB, `institution-a-${institutionA}`, `institution-b-${institutionB}`],
    );
    await client.query(
      `INSERT INTO programmes (id, tenant_id, institution_id, name, code) VALUES
       ($1, $3, $5, 'Programme A', $7),
       ($2, $4, $6, 'Programme B', $8)`,
      [
        programmeA,
        programmeB,
        tenantA,
        tenantB,
        institutionA,
        institutionB,
        `PROGRAMME-A-${programmeA}`,
        `PROGRAMME-B-${programmeB}`,
      ],
    );
    await client.query(
      `INSERT INTO courses (id, tenant_id, institution_id, programme_id, title, code) VALUES
       ($1, $3, $5, $7, 'Course A', $9)`,
      [courseA, randomUUID(), tenantA, tenantA, institutionA, institutionA, programmeA, programmeA, `COURSE-A-${courseA}`],
    );

    await assertForeignKeyViolation(
      () => client.query(
        `INSERT INTO courses (id, tenant_id, institution_id, programme_id, title, code)
         VALUES ($1, $2, $3, $4, 'Cross-tenant programme course', $5)`,
        [randomUUID(), tenantB, institutionB, programmeA, `CROSS-TENANT-${randomUUID()}`],
      ),
      "courses_tenant_institution_programme_fk",
    );
    await assertForeignKeyViolation(
      () => client.query(
        `INSERT INTO courses (id, tenant_id, institution_id, programme_id, title, code)
         VALUES ($1, $2, $3, $4, 'Wrong institution programme course', $5)`,
        [randomUUID(), tenantA, institutionB, programmeA, `WRONG-INSTITUTION-${randomUUID()}`],
      ),
      "courses_tenant_institution_programme_fk",
    );

    await client.query(
      `INSERT INTO course_modules (id, tenant_id, course_id, title, sequence)
       VALUES ($1, $2, $3, 'Module A', 1)`,
      [moduleA, tenantA, courseA],
    );
    await assertForeignKeyViolation(
      () => client.query(
        `INSERT INTO course_modules (id, tenant_id, course_id, title, sequence)
         VALUES ($1, $2, $3, 'Cross-tenant course module', 1)`,
        [randomUUID(), tenantB, courseA],
      ),
      "course_modules_tenant_course_fk",
    );

    await client.query(
      `INSERT INTO lessons (id, tenant_id, module_id, title, sequence)
       VALUES ($1, $2, $3, 'Lesson A', 1)`,
      [lessonA, tenantA, moduleA],
    );
    await assertForeignKeyViolation(
      () => client.query(
        `INSERT INTO lessons (id, tenant_id, module_id, title, sequence)
         VALUES ($1, $2, $3, 'Cross-tenant module lesson', 1)`,
        [randomUUID(), tenantB, moduleA],
      ),
      "lessons_tenant_module_fk",
    );

    await client.query(
      `INSERT INTO learning_resources (id, tenant_id, lesson_id, resource_type, title, url, sequence)
       VALUES ($1, $2, $3, 'LINK', 'Resource A', 'https://example.com/resource-a', 1)`,
      [randomUUID(), tenantA, lessonA],
    );
    await assertForeignKeyViolation(
      () => client.query(
        `INSERT INTO learning_resources (id, tenant_id, lesson_id, resource_type, title, url, sequence)
         VALUES ($1, $2, $3, 'LINK', 'Cross-tenant lesson resource', 'https://example.com/resource-b', 1)`,
        [randomUUID(), tenantB, lessonA],
      ),
      "learning_resources_tenant_lesson_fk",
    );

    const validCounts = await client.query<{ courses: string; modules: string; lessons: string; resources: string }>(
      `SELECT
         (SELECT count(*)::text FROM courses WHERE id = $1) AS courses,
         (SELECT count(*)::text FROM course_modules WHERE id = $2) AS modules,
         (SELECT count(*)::text FROM lessons WHERE id = $3) AS lessons,
         (SELECT count(*)::text FROM learning_resources WHERE tenant_id = $4 AND lesson_id = $3) AS resources`,
      [courseA, moduleA, lessonA, tenantA],
    );
    assert.deepEqual(validCounts.rows[0], { courses: "1", modules: "1", lessons: "1", resources: "1" });
  } finally {
    await client.end();
    await dropSchema(schema);
  }
});