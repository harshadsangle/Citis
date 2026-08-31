import { OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
export declare class DatabaseService implements OnModuleDestroy {
    readonly pool: Pool;
    constructor();
    query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<import("pg").QueryResult<T>>;
    transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T>;
    onModuleDestroy(): Promise<void>;
}
