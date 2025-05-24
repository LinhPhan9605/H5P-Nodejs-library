import PostgresqlConnection from './index';
import { defaultConfig } from './config';

async function example() {
  // Tạo kết nối với config mặc định
  const db = new PostgresqlConnection(defaultConfig);

  try {
    // Kết nối đến database
    await db.connect();

    // Ví dụ tạo bảng
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ví dụ thêm dữ liệu
    const insertResult = await db.query<{ id: number; username: string }>(
      'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id, username',
      ['testuser', 'test@example.com']
    );
    console.log('Inserted user:', insertResult.rows[0]);

    // Ví dụ truy vấn dữ liệu
    const queryResult = await db.query<{ id: number; username: string; email: string }>(
      'SELECT * FROM users'
    );
    console.log('All users:', queryResult.rows);

  } catch (error) {
    console.error('Error in example:', error);
  } finally {
    // Đóng kết nối
    await db.end();
  }
}

// Chạy ví dụ
example().catch(console.error); 