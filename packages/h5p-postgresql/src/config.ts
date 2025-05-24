import { PoolConfig } from 'pg';

export interface DatabaseConfig extends PoolConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  max?: number; // maximum number of clients in the pool
  idleTimeoutMillis?: number; // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis?: number; // how long to wait when connecting a new client
  ssl?: boolean | object; // SSL configuration
}

// Default config
export const defaultConfig: DatabaseConfig = {
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