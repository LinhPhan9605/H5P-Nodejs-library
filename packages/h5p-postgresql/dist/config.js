"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
// Default config
exports.defaultConfig = {
    user: process.env.POSTGRES_USER || 'admin',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'lms',
    password: process.env.POSTGRES_PASSWORD || 'admin123',
    port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false
};
