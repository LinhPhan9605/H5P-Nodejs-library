"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const config_1 = require("./config");
async function testConnection() {
    const db = new index_1.default(config_1.defaultConfig);
    try {
        console.log('Attempting to connect to PostgreSQL with config:', {
            host: config_1.defaultConfig.host,
            port: config_1.defaultConfig.port,
            database: config_1.defaultConfig.database,
            user: config_1.defaultConfig.user,
            // Không log password vì lý do bảo mật
        });
        // Test kết nối
        await db.connect();
        console.log('✅ Connection successful!');
        // Test query đơn giản
        const result = await db.query('SELECT version()');
        console.log('PostgreSQL version:', result.rows[0].version);
        // Test tạo và xóa bảng tạm thời
        await db.query(`
      CREATE TEMP TABLE connection_test (
        id SERIAL PRIMARY KEY,
        test_data TEXT
      )
    `);
        console.log('✅ Temporary table created successfully');
        // Test insert
        await db.query('INSERT INTO connection_test (test_data) VALUES ($1)', ['Test successful']);
        console.log('✅ Insert operation successful');
        // Test select
        const selectResult = await db.query('SELECT * FROM connection_test');
        console.log('✅ Select operation successful:', selectResult.rows);
        console.log('\n🎉 All connection tests passed successfully!\n');
    }
    catch (error) {
        console.error('\n❌ Connection test failed:', error);
        process.exit(1);
    }
    finally {
        // Đóng kết nối
        await db.end();
        console.log('Connection closed');
    }
}
// Chạy test
console.log('\n🔍 Starting PostgreSQL connection test...\n');
testConnection().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
