import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { repairCourseApproval } from "./repair-course-approval-db.mjs";

test("repair restores missing approval columns despite a stale migration record and preserves courses", async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const schema = `approval_repair_test_${randomUUID().replaceAll("-", "")}`;
  try {
    await client.query(`CREATE SCHEMA ${schema}`);
    await client.query(`SET search_path TO ${schema}`);
    await client.query(`
      CREATE TABLE users(id uuid PRIMARY KEY);
      CREATE TABLE courses(id uuid PRIMARY KEY, title text, status text);
      CREATE TABLE schema_migrations(version text PRIMARY KEY);
      CREATE TABLE permissions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        module text, resource text, action text, code text UNIQUE, description text);
      CREATE TABLE roles(id uuid PRIMARY KEY, tenant_id uuid, code text);
      CREATE TABLE role_permissions(role_id uuid, permission_id uuid, PRIMARY KEY(role_id, permission_id));
      INSERT INTO courses VALUES ('11111111-1111-4111-8111-111111111111','Preserve this course','PUBLISHED');
      INSERT INTO schema_migrations VALUES ('030_lms_course_approval_workflow');
    `);
    const result = await repairCourseApproval(client);
    assert.equal(result.addedColumns.length, 5);
    assert.equal(result.coursesPreserved, 1);
    const course = (await client.query("SELECT title, status, rejection_reason FROM courses")).rows[0];
    assert.deepEqual(course, { title: "Preserve this course", status: "PUBLISHED", rejection_reason: null });
    assert.deepEqual((await repairCourseApproval(client)).addedColumns, []);
    await client.query("UPDATE schema_migration_checksums SET checksum = 'test-mismatch'");
    await assert.rejects(repairCourseApproval(client), /checksum mismatch/);
    assert.equal((await client.query("SELECT count(*)::int AS n FROM courses")).rows[0].n, 1);
  } finally {
    // Only this test's randomly named, isolated fixture schema is removed.
    await client.query("SET search_path TO public");
    await client.query(`DROP SCHEMA ${schema} CASCADE`);
    await client.end();
  }
});