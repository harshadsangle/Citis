"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const load_env_1 = require("../config/load-env");
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
function safeDatabaseTarget(connectionString) {
    try {
        const databaseUrl = new URL(connectionString);
        return {
            host: databaseUrl.hostname,
            database: decodeURIComponent(databaseUrl.pathname.replace(/^\/+/, "")) || "(default)",
        };
    }
    catch {
        return { host: "(unavailable)", database: "(unavailable)" };
    }
}
let DatabaseService = class DatabaseService {
    pool;
    constructor() {
        (0, load_env_1.loadLocalEnvironment)();
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error("DATABASE_URL is required to create the database pool.");
        }
        const target = safeDatabaseTarget(connectionString);
        console.log(`CITIS API database target: host=${target.host} database=${target.database}`);
        this.pool = new pg_1.Pool({
            connectionString,
            max: Number(process.env.DATABASE_POOL_MAX || 10),
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: 5_000,
        });
    }
    query(text, values = []) {
        return this.pool.query(text, values);
    }
    async transaction(work) {
        const client = await this.pool.connect();
        try {
            await client.query("BEGIN");
            const result = await work(client);
            await client.query("COMMIT");
            return result;
        }
        catch (error) {
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            client.release();
        }
    }
    async onModuleDestroy() {
        await this.pool.end();
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DatabaseService);
//# sourceMappingURL=database.service.js.map