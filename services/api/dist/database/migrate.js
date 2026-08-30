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
        const migration = await (0, promises_1.readFile)((0, node_path_1.resolve)(process.cwd(), "packages/database/migrations/001_foundation.sql"), "utf8");
        await client.query(migration);
        console.log("Applied 001_foundation");
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