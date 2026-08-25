import { Pool, type QueryResultRow } from "pg";

type DbGlobal = typeof globalThis & { __citisLmsPool?: Pool };
const dbGlobal = globalThis as DbGlobal;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to use the LMS database.");
  }

  if (!dbGlobal.__citisLmsPool) {
    dbGlobal.__citisLmsPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    });
  }

  return dbGlobal.__citisLmsPool;
}

export async function queryLms<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return getPool().query<T>(text, values);
}

export async function closeLmsDatabase() {
  if (dbGlobal.__citisLmsPool) {
    await dbGlobal.__citisLmsPool.end();
    dbGlobal.__citisLmsPool = undefined;
  }
}