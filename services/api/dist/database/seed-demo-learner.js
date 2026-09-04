"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = __importDefault(require("pg"));
const bcrypt = __importStar(require("bcryptjs"));
const load_env_1 = require("../config/load-env");
(0, load_env_1.loadLocalEnvironment)();
const { Pool } = pg_1.default;
const DEMO_TENANT_SLUG = "citis-platform";
const DEMO_LEARNER_EMAIL = "learner.demo@citis.in";
function requiredDemoLearnerPassword() {
    const value = process.env.DEMO_LEARNER_PASSWORD;
    if (!value) {
        throw new Error("DEMO_LEARNER_PASSWORD is required to seed the demo learner.");
    }
    return value;
}
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed the demo learner.");
}
async function seedDemoLearner(password) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        // Serialize repeated or concurrent local seed runs for this account.
        await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [DEMO_LEARNER_EMAIL]);
        const tenantResult = await client.query(`SELECT id
       FROM tenants
       WHERE slug = $1 AND status = 'ACTIVE'
       LIMIT 1
       FOR UPDATE`, [DEMO_TENANT_SLUG]);
        const tenant = tenantResult.rows[0];
        if (!tenant) {
            throw new Error(`Active tenant "${DEMO_TENANT_SLUG}" was not found. Run the database migrations first.`);
        }
        const institutionResult = await client.query(`SELECT id, name
       FROM institutions
       WHERE tenant_id = $1 AND status = 'ACTIVE'
       ORDER BY created_at, id
       LIMIT 1
       FOR UPDATE`, [tenant.id]);
        const institution = institutionResult.rows[0];
        if (!institution) {
            throw new Error(`No active institution was found in tenant "${DEMO_TENANT_SLUG}". Create one before seeding the learner.`);
        }
        const roleResult = await client.query(`SELECT id
       FROM roles
       WHERE tenant_id = $1 AND code = 'STUDENT' AND status = 'ACTIVE'
       LIMIT 1
       FOR UPDATE`, [tenant.id]);
        const studentRole = roleResult.rows[0];
        if (!studentRole) {
            throw new Error(`Active STUDENT role was not found in tenant "${DEMO_TENANT_SLUG}". Run the database migrations first.`);
        }
        // Match AuthService.login(), which verifies password_hash with bcrypt.
        const passwordHash = await bcrypt.hash(password, 12);
        const existingUserResult = await client.query(`SELECT id
       FROM users
       WHERE tenant_id = $1 AND lower(email) = lower($2)
       LIMIT 1
       FOR UPDATE`, [tenant.id, DEMO_LEARNER_EMAIL]);
        let userId;
        let action;
        if (existingUserResult.rows[0]) {
            userId = existingUserResult.rows[0].id;
            await client.query(`UPDATE users
         SET email = $2, password_hash = $3, first_name = 'Demo', last_name = 'Learner',
             status = 'ACTIVE', updated_at = now()
         WHERE id = $1 AND tenant_id = $4`, [userId, DEMO_LEARNER_EMAIL, passwordHash, tenant.id]);
            action = "updated";
        }
        else {
            const userResult = await client.query(`INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, status)
         VALUES ($1, $2, $3, 'Demo', 'Learner', 'ACTIVE')
         RETURNING id`, [tenant.id, DEMO_LEARNER_EMAIL, passwordHash]);
            userId = userResult.rows[0].id;
            action = "created";
        }
        // Replace only this demo user's STUDENT assignments so the seed is
        // idempotent even when NULL campus values bypass a unique constraint.
        await client.query(`DELETE FROM user_roles
       WHERE tenant_id = $1
         AND user_id = $2
         AND role_id = $3`, [tenant.id, userId, studentRole.id]);
        await client.query(`INSERT INTO user_roles (tenant_id, user_id, role_id, institution_id, campus_id)
       VALUES ($1, $2, $3, $4, NULL)
       ON CONFLICT (user_id, role_id, institution_id, campus_id) DO NOTHING`, [tenant.id, userId, studentRole.id, institution.id]);
        await client.query("COMMIT");
        console.log(`Demo learner ${action}; ACTIVE STUDENT scope ready for ${DEMO_LEARNER_EMAIL} in ${institution.name}.`);
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
        await pool.end();
    }
}
seedDemoLearner(requiredDemoLearnerPassword()).catch((error) => {
    console.error(`Demo learner seed failed: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
});
//# sourceMappingURL=seed-demo-learner.js.map