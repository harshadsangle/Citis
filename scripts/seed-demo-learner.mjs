import pg from "pg";
import * as bcrypt from "bcryptjs";

const { Pool } = pg;

const DEMO_TENANT_SLUG = "citis-platform";
const DEMO_LEARNER_EMAIL = "learner.demo@citis.in";
const DEMO_LEARNER_PASSWORD = "Password123!";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed the demo learner.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query("BEGIN");

  const tenantResult = await client.query(
    "SELECT id FROM tenants WHERE slug = $1 AND status = 'ACTIVE'",
    [DEMO_TENANT_SLUG],
  );
  const tenant = tenantResult.rows[0];
  if (!tenant) {
    throw new Error(`Active tenant "${DEMO_TENANT_SLUG}" was not found. Run the database migrations first.`);
  }

  const passwordHash = await bcrypt.hash(DEMO_LEARNER_PASSWORD, 12);
  const existingUserResult = await client.query(
    `SELECT id
     FROM users
     WHERE tenant_id = $1 AND lower(email) = lower($2)
     FOR UPDATE`,
    [tenant.id, DEMO_LEARNER_EMAIL],
  );

  let userId;
  let action;
  if (existingUserResult.rows[0]) {
    userId = existingUserResult.rows[0].id;
    await client.query(
      `UPDATE users
       SET password_hash = $2, status = 'ACTIVE', updated_at = now()
       WHERE id = $1`,
      [userId, passwordHash],
    );
    action = "updated";
  } else {
    const userResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, status)
       VALUES ($1, $2, $3, 'Demo', 'Learner', 'ACTIVE')
       RETURNING id`,
      [tenant.id, DEMO_LEARNER_EMAIL, passwordHash],
    );
    userId = userResult.rows[0].id;
    action = "created";
  }

  const roleResult = await client.query(
    `SELECT id
     FROM roles
     WHERE tenant_id = $1 AND code = 'STUDENT' AND status = 'ACTIVE'`,
    [tenant.id],
  );
  const studentRole = roleResult.rows[0];
  if (!studentRole) {
    throw new Error(`Active STUDENT role was not found in tenant "${DEMO_TENANT_SLUG}".`);
  }

  const assignmentResult = await client.query(
    `SELECT id
     FROM user_roles
     WHERE tenant_id = $1 AND user_id = $2 AND role_id = $3
     LIMIT 1`,
    [tenant.id, userId, studentRole.id],
  );

  if (!assignmentResult.rows[0]) {
    const institutionResult = await client.query(
      `SELECT id
       FROM institutions
       WHERE tenant_id = $1 AND status <> 'ARCHIVED'
       ORDER BY created_at
       LIMIT 1`,
      [tenant.id],
    );
    const institution = institutionResult.rows[0];
    if (!institution) {
      throw new Error(`No active institution was found in tenant "${DEMO_TENANT_SLUG}" for the STUDENT role.`);
    }

    await client.query(
      `INSERT INTO user_roles (tenant_id, user_id, role_id, institution_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, role_id, institution_id, campus_id) DO NOTHING`,
      [tenant.id, userId, studentRole.id, institution.id],
    );
  }

  await client.query("COMMIT");
  console.log(`Demo learner ${action}; password and STUDENT role are ready for ${DEMO_LEARNER_EMAIL}.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}