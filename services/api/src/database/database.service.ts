import { loadLocalEnvironment } from "../config/load-env";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

function safeDatabaseTarget(connectionString: string) {
  try {
    const databaseUrl = new URL(connectionString);
    return {
      host: databaseUrl.hostname,
      database: decodeURIComponent(databaseUrl.pathname.replace(/^\/+/, "")) || "(default)",
    };
  } catch {
    return { host: "(unavailable)", database: "(unavailable)" };
  }
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly pool: Pool;

  constructor() {
    loadLocalEnvironment();
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required to create the database pool.");
    }

    const target = safeDatabaseTarget(connectionString);
    console.log(`CITIS API database target: host=${target.host} database=${target.database}`);

    this.pool = new Pool({
      connectionString,
      max: Number(process.env.DATABASE_POOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
    return this.pool.query<T>(text, values);
  }

  async transaction<T>(work: (client: PoolClient) => Promise<T>) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}