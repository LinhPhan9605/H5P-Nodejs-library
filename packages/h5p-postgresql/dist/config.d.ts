import { PoolConfig } from 'pg';
export interface DatabaseConfig extends PoolConfig {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
    ssl?: boolean | object;
}
export declare const defaultConfig: DatabaseConfig;
