import { getLocalEnvironmentSource, loadLocalEnvironment } from "../config/load-env";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

let nextDatabaseServiceInstanceId = 1;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly pool: Pool;
  readonly instanceId = nextDatabaseServiceInstanceId++;

  constructor() {
    loadLocalEnvironment();
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required to create the database pool.");
    }
    const parsed = new URL(connectionString);
    console.log("[DatabaseService] runtime", {
      pid: process.pid,
      databaseServiceInstanceId: this.instanceId,
      poolInstanceId: this.instanceId,
      environmentSource: getLocalEnvironmentSource(),
      databaseUrlExists: true,
      hostname: parsed.hostname,
      database: decodeURIComponent(parsed.pathname.replace(/^\/+/, "")),
      passwordExists: parsed.password.length > 0,
      passwordLength: parsed.password.length,
    });

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