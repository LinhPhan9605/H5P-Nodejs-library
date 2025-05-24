import 'dotenv/config';
import { PoolConfig, QueryResult, QueryResultRow } from 'pg';
export declare class PostgresqlConnection {
    private pool;
    constructor(config: PoolConfig);
    connect(): Promise<void>;
    query<T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
}
export default PostgresqlConnection;
