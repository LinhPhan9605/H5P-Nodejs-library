import 'dotenv/config';
import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';

export class PostgresqlConnection {
  private pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config);
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      client.release();
      console.log('Successfully connected to PostgreSQL');
    } catch (error) {
      console.error('Error connecting to PostgreSQL:', error);
      throw error;
    }
  }

  async query<T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
    try {
      return await this.pool.query<T>(text, params);
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  async end(): Promise<void> {
    await this.pool.end();
  }
}

export default PostgresqlConnection; 