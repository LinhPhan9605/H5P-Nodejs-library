"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresqlConnection = void 0;
require("dotenv/config");
const pg_1 = require("pg");
class PostgresqlConnection {
    constructor(config) {
        this.pool = new pg_1.Pool(config);
    }
    async connect() {
        try {
            const client = await this.pool.connect();
            client.release();
            console.log('Successfully connected to PostgreSQL');
        }
        catch (error) {
            console.error('Error connecting to PostgreSQL:', error);
            throw error;
        }
    }
    async query(text, params) {
        try {
            return await this.pool.query(text, params);
        }
        catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }
    async end() {
        await this.pool.end();
    }
}
exports.PostgresqlConnection = PostgresqlConnection;
exports.default = PostgresqlConnection;
