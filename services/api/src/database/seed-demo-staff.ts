import pg from "pg";
import * as bcrypt from "bcryptjs";
import { loadLocalEnvironment } from "../config/load-env";

loadLocalEnvironment();

const { Pool } = pg;

const DEMO_TENANT_SLUG = "citis-platform";
const DEMO_INSTITUTION_SLUG = "citis-lms-demo";
const DEMO_INSTITUTION_NAME = "CITIS LMS Demo Institution";

const STAFF_TARGETS = {
  admin: {
    email: "admin.demo@citis.in",
    firstName: "Demo",
    lastName: "Admin",
    roleCode: "INSTITUTION_ADMINISTRATOR",
    passwordEnvironmentKey: "DEMO_ADMIN_PASSWORD",
  },
  instructor: {
    email: "instructor.demo@citis.in",
    firstName: "Demo",
    lastName: "Instructor",
    roleCode: "TEACHER",
    passwordEnvironmentKey: "DEMO_INSTRUCTOR_PASSWORD",
  },
} as const;

type StaffTargetName = keyof typeof STAFF_TARGETS;

function getStaffTarget(): (typeof STAFF_TARGETS)[StaffTargetName] {
  const targetName = process.argv[2] as StaffTargetName | undefined;
  if (!targetName || !Object.hasOwn(STAFF_TARGETS, targetName)) {
    throw new Error("Choose a demo staff target: admin or instructor.");
  }
  return STAFF_TARGETS[targetName];
}

function requiredPassword(environmentKey: string) {
  const value = process.env[environmentKey];
  if (!value) {
    throw new Error(`${environmentKey} is required to seed this demo staff account.`);
  }
  return value;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed the demo staff account.");
}

async function seedDemoStaff(target: (typeof STAFF_TARGETS)[StaffTargetName], password: string) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [target.email]);

    const tenantResult = await client.query<{ id: string }>(
      `SELECT id
       FROM tenants
       WHERE slug = $1 AND status = 'ACTIVE'
       LIMIT 1
       FOR UPDATE`,
      [DEMO_TENANT_SLUG],
    );
    const tenant = tenantResult.rows[0];
    if (!tenant) {
      throw new Error(`Active tenant "${DEMO_TENANT_SLUG}" was not found. Run the database migrations first.`);
    }

    const institutionResult = await client.query<{ id: string; name: string }>(
      `INSERT INTO institutions (tenant_id, name, slug, institution_type, status)
       VALUES ($1, $2, $3, 'SCHOOL', 'ACTIVE')
       ON CONFLICT (tenant_id, slug) DO UPDATE
       SET name = EXCLUDED.name, status = 'ACTIVE', updated_at = now()
       RETURNING id, name`,
      [tenant.id, DEMO_INSTITUTION_NAME, DEMO_INSTITUTION_SLUG],
    );
    const institution = institutionResult.rows[0];

    const roleResult = await client.query<{ id: string }>(
      `SELECT id
       FROM roles
       WHERE tenant_id = $1 AND code = $2 AND status = 'ACTIVE'
       LIMIT 1
       FOR UPDATE`,
      [tenant.id, target.roleCode],
    );
    const role = roleResult.rows[0];
    if (!role) {
      throw new Error(`Active ${target.roleCode} role was not found in tenant "${DEMO_TENANT_SLUG}". Run the database migrations first.`);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const existingUserResult = await client.query<{ id: string }>(
      `SELECT id
       FROM users
       WHERE tenant_id = $1 AND lower(email) = lower($2)
       LIMIT 1
       FOR UPDATE`,
      [tenant.id, target.email],
    );

    let userId: string;
    let action: "created" | "updated";
    if (existingUserResult.rows[0]) {
      userId = existingUserResult.rows[0].id;
      await client.query(
        `UPDATE users
         SET email = $2, password_hash = $3, first_name = $4, last_name = $5,
             status = 'ACTIVE', updated_at = now()
         WHERE id = $1 AND tenant_id = $6`,
        [userId, target.email, passwordHash, target.firstName, target.lastName, tenant.id],
      );
      action = "updated";
    } else {
      const userResult = await client.query<{ id: string }>(
        `INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, status)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
         RETURNING id`,
        [tenant.id, target.email, passwordHash, target.firstName, target.lastName],
      );
      userId = userResult.rows[0].id;
      action = "created";
    }

    // Replace this demo user's assignment for the target role so reruns remain
    // idempotent even when NULL campus values bypass a unique constraint.
    await client.query(
      `DELETE FROM user_roles
       WHERE tenant_id = $1
         AND user_id = $2
         AND role_id = $3`,
      [tenant.id, userId, role.id],
    );
    await client.query(
      `INSERT INTO user_roles (tenant_id, user_id, role_id, institution_id, campus_id)
       VALUES ($1, $2, $3, $4, NULL)
       ON CONFLICT (user_id, role_id, institution_id, campus_id) DO NOTHING`,
      [tenant.id, userId, role.id, institution.id],
    );

    await client.query("COMMIT");
    console.log(
      `Demo ${target.roleCode} account ${action}; ACTIVE institution scope ready for ${target.email} in ${institution.name}.`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

const target = getStaffTarget();
seedDemoStaff(target, requiredPassword(target.passwordEnvironmentKey)).catch((error) => {
  console.error(`Demo staff seed failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});