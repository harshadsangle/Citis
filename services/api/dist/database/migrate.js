"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const pg_1 = require("pg");
async function main() {
    const client = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        const migrationRootCandidates = [
            (0, node_path_1.resolve)(process.cwd(), "packages/database/migrations"),
            (0, node_path_1.resolve)(process.cwd(), "../../packages/database/migrations"),
        ];
        const migrationRoot = await migrationRootCandidates.reduce(async (current, candidate) => {
            const found = await current;
            if (found)
                return found;
            try {
                await (0, promises_1.access)(candidate);
                return candidate;
            }
            catch {
                return null;
            }
        }, Promise.resolve(null));
        if (!migrationRoot)
            throw new Error("Could not locate packages/database/migrations from the current working directory.");
        for (const version of ["001_foundation", "002_lms_course_management", "003_lms_managed_resources", "004_lms_enrollment_assignments", "005_lms_progress_tracking", "006_lms_assignments", "007_lms_scope_isolation"]) {
            const migration = await (0, promises_1.readFile)((0, node_path_1.resolve)(migrationRoot, `${version}.sql`), "utf8");
            await client.query(migration);
            console.log(`Applied ${version}`);
        }
    }
    finally {
        await client.end();
    }
}
main().catch((error) => {
    console.error("Database migration failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=migrate.js.map