import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;
const schemaPath = resolve(process.cwd(), "citis-infotech/frontend/lib/lms-schema.sql");
const schema = await readFile(schemaPath, "utf8");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to initialize the LMS database.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(schema);
  console.log("LMS database schema is ready.");
} finally {
  await pool.end();
}