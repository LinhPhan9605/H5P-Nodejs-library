import { PostgresqlConnection } from '../../../h5p-postgresql/dist';
import { defaultConfig } from '../../../h5p-postgresql/dist/config';
import { IUser } from '@LinhPhan9605/h5p-server';

export interface H5PContent {
  id: string;
  title: string;
  content_type: string;
  slug: string;
  parameters: any;
  filtered: any;
  library_id: number;
  user_id: string;
  license: string;
  keywords: string[];
  description: string;
  authors: any[];
  source: string;
  year_from: number;
  year_to: number;
  changes: any[];
  created_at: Date;
  updated_at: Date;
}

export interface H5PLibrary {
  id: number;
  name: string;
  title: string;
  major_version: number;
  minor_version: number;
  patch_version: number;
  runnable: boolean;
  restricted: boolean;
  fullscreen: boolean;
  embed_types: string[];
  preloaded_js: string[];
  preloaded_css: string[];
  drop_library_css: string[];
  semantics: any;
  created_at: Date;
  updated_at: Date;
}

export interface H5PScore {
  id: number;
  content_id: string;
  user_id: string;
  score: number;
  max_score: number;
  finished: boolean;
  time_spent?: number;
  completion_time: Date;
  interaction_pattern?: any;
  answers?: any;
  created_at: Date;
}

export interface H5PScoreStats {
  total_attempts: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  average_time_spent: number;
}

export class H5PContentService {
  private db: PostgresqlConnection;
  private initialized: boolean = false;

  constructor() {
    this.db = new PostgresqlConnection(defaultConfig);
  }

  private async dropTables() {
    try {
      await this.db.connect();
      
      // Drop các bảng theo thứ tự (để tránh lỗi foreign key)
      await this.db.query('DROP TABLE IF EXISTS h5p_content_user_data CASCADE;');
      await this.db.query('DROP TABLE IF EXISTS h5p_content_files CASCADE;');
      await this.db.query('DROP TABLE IF EXISTS h5p_contents CASCADE;');
      await this.db.query('DROP TABLE IF EXISTS h5p_libraries CASCADE;');
      
      console.log('✅ Dropped all existing tables');
    } catch (error) {
      console.error('Failed to drop tables:', error);
      throw error;
    }
  }

  private async initializeDatabase() {
    if (this.initialized) return;

    try {
      await this.dropTables(); // Drop các bảng cũ trước khi tạo mới
      
      // Tạo bảng h5p_libraries
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS h5p_libraries (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          major_version INTEGER NOT NULL,
          minor_version INTEGER NOT NULL,
          patch_version INTEGER NOT NULL,
          runnable BOOLEAN DEFAULT false,
          restricted BOOLEAN DEFAULT false,
          fullscreen BOOLEAN DEFAULT false,
          embed_types JSONB DEFAULT '[]',
          preloaded_js JSONB DEFAULT '[]',
          preloaded_css JSONB DEFAULT '[]',
          drop_library_css JSONB DEFAULT '[]',
          semantics JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(name, major_version, minor_version, patch_version)
        );
      `);

      // Tạo bảng h5p_contents với BIGINT cho id
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS h5p_contents (
          id BIGINT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content_type VARCHAR(255),
          slug VARCHAR(255),
          parameters JSONB NOT NULL,
          filtered JSONB,
          library_id INTEGER REFERENCES h5p_libraries(id),
          user_id VARCHAR(255) NOT NULL,
          license VARCHAR(255),
          keywords TEXT[],
          description TEXT,
          authors JSONB DEFAULT '[]',
          source VARCHAR(255),
          year_from INTEGER,
          year_to INTEGER,
          changes JSONB DEFAULT '[]',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Tạo bảng h5p_content_files với BIGINT cho content_id
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS h5p_content_files (
          id SERIAL PRIMARY KEY,
          content_id BIGINT REFERENCES h5p_contents(id) ON DELETE CASCADE,
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(255) NOT NULL,
          mime_type VARCHAR(255),
          file_size BIGINT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(content_id, file_path)
        );
      `);

      // Tạo bảng h5p_content_user_data với BIGINT cho content_id
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS h5p_content_user_data (
          id SERIAL PRIMARY KEY,
          content_id BIGINT REFERENCES h5p_contents(id) ON DELETE CASCADE,
          user_id VARCHAR(255) NOT NULL,
          sub_content_id INTEGER,
          data_type VARCHAR(255) NOT NULL,
          data JSONB NOT NULL,
          preload BOOLEAN DEFAULT false,
          invalidate BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(content_id, user_id, sub_content_id, data_type)
        );
      `);

      // Tạo bảng h5p_content_scores
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS h5p_content_scores (
          id SERIAL PRIMARY KEY,
          content_id BIGINT REFERENCES h5p_contents(id) ON DELETE CASCADE,
          user_id VARCHAR(255) NOT NULL,
          score INTEGER NOT NULL,
          max_score INTEGER NOT NULL,
          finished BOOLEAN DEFAULT true,
          time_spent INTEGER,
          completion_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          interaction_pattern JSONB,
          answers JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(content_id, user_id, completion_time)
        );
      `);

      console.log('✅ All tables created successfully');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async saveContent(
    title: string,
    contentType: string,
    parameters: any,
    libraryName: string,
    libraryVersion: string,
    user: IUser,
    metadata: any = {}
  ): Promise<string> {
    try {
      await this.initializeDatabase();

      // Validate input parameters
      if (!title || !contentType || !parameters || !libraryName || !libraryVersion || !user) {
        throw new Error('Missing required parameters for content creation');
      }

      // Parse library version with validation
      const versionParts = libraryVersion.split('.');
      if (versionParts.length !== 3) {
        throw new Error(`Invalid library version format: ${libraryVersion}. Expected format: major.minor.patch`);
      }
      const [majorVersion, minorVersion, patchVersion] = versionParts.map(Number);
      if (isNaN(majorVersion) || isNaN(minorVersion) || isNaN(patchVersion)) {
        throw new Error(`Invalid library version numbers in: ${libraryVersion}`);
      }

      // Tạo hoặc lấy thông tin library
      let libraryResult;
      try {
        libraryResult = await this.db.query<{ id: number }>(`
          INSERT INTO h5p_libraries (name, title, major_version, minor_version, patch_version)
          VALUES ($1, $1, $2, $3, $4)
          ON CONFLICT (name, major_version, minor_version, patch_version) 
          DO UPDATE SET updated_at = CURRENT_TIMESTAMP
          RETURNING id
        `, [libraryName, majorVersion, minorVersion, patchVersion]);

        if (!libraryResult.rows.length) {
          throw new Error('Failed to create or update library record');
        }
      } catch (error) {
        throw new Error(`Failed to handle library record: ${error.message}`);
      }

      // Tạo content mới với contentId từ parameters
      try {
        const contentId = parameters.contentId ? BigInt(parameters.contentId) : null;
        if (!contentId) {
          throw new Error('Content ID is required');
        }

        const result = await this.db.query<{ id: string }>(`
          INSERT INTO h5p_contents (
            id, title, content_type, parameters, library_id, user_id,
            license, keywords, description, authors, source,
            year_from, year_to, changes
          )
          VALUES (
            $1, $2, $3, $4::jsonb, $5, $6,
            $7, $8, $9, $10::jsonb, $11,
            $12, $13, $14::jsonb
          )
          RETURNING id
        `, [
          contentId.toString(),
          title,
          contentType,
          JSON.stringify(parameters),
          libraryResult.rows[0].id,
          user.id,
          metadata.license || null,
          metadata.keywords || [],
          metadata.description || null,
          JSON.stringify(metadata.authors || []),
          metadata.source || null,
          metadata.yearFrom || null,
          metadata.yearTo || null,
          JSON.stringify(metadata.changes || [])
        ]);

        if (!result.rows.length) {
          throw new Error('Failed to create content record');
        }

        return result.rows[0].id.toString();
      } catch (error) {
        throw new Error(`Failed to create content record: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to save H5P content:', error);
      throw error;
    }
  }

  async saveContentFile(
    contentId: string,
    fileName: string,
    filePath: string,
    mimeType: string,
    fileSize: number
  ): Promise<void> {
    try {
      await this.initializeDatabase();
      await this.db.query(`
        INSERT INTO h5p_content_files (content_id, file_name, file_path, mime_type, file_size)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (content_id, file_path) 
        DO UPDATE SET 
          file_name = EXCLUDED.file_name,
          mime_type = EXCLUDED.mime_type,
          file_size = EXCLUDED.file_size
      `, [contentId, fileName, filePath, mimeType, fileSize]);
    } catch (error) {
      console.error('Failed to save content file:', error);
      throw error;
    }
  }

  async saveUserData(
    contentId: string,
    user: IUser,
    dataType: string,
    data: any,
    subContentId: number | null = null,
    preload: boolean = false
  ): Promise<void> {
    try {
      await this.initializeDatabase();
      await this.db.query(`
        INSERT INTO h5p_content_user_data (
          content_id, user_id, sub_content_id, data_type, data, preload
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6)
        ON CONFLICT (content_id, user_id, sub_content_id, data_type) 
        DO UPDATE SET 
          data = $5::jsonb,
          preload = $6,
          updated_at = CURRENT_TIMESTAMP
      `, [contentId, user.id, subContentId, dataType, JSON.stringify(data), preload]);
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }

  async getContent(contentId: string): Promise<H5PContent | null> {
    try {
      await this.initializeDatabase();
      const result = await this.db.query<H5PContent>(`
        SELECT 
          c.*,
          l.name as library_name,
          l.major_version,
          l.minor_version,
          l.patch_version
        FROM h5p_contents c
        LEFT JOIN h5p_libraries l ON c.library_id = l.id
        WHERE c.id = $1
      `, [contentId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get H5P content:', error);
      throw error;
    }
  }

  async getContentFiles(contentId: string): Promise<any[]> {
    try {
      await this.initializeDatabase();
      const result = await this.db.query(`
        SELECT * FROM h5p_content_files
        WHERE content_id = $1
      `, [contentId]);
      return result.rows;
    } catch (error) {
      console.error('Failed to get content files:', error);
      throw error;
    }
  }

  async getUserData(
    contentId: string,
    user: IUser,
    dataType: string,
    subContentId: number | null = null
  ): Promise<any | null> {
    try {
      await this.initializeDatabase();
      const result = await this.db.query(`
        SELECT * FROM h5p_content_user_data
        WHERE content_id = $1 
        AND user_id = $2 
        AND data_type = $3
        AND sub_content_id IS NOT DISTINCT FROM $4
      `, [contentId, user.id, dataType, subContentId]);
      return result.rows[0]?.data || null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      throw error;
    }
  }

  async updateContent(
    contentId: string,
    title: string,
    parameters: any,
    metadata: any = {}
  ): Promise<void> {
    try {
      await this.initializeDatabase();
      await this.db.query(`
        UPDATE h5p_contents 
        SET 
          title = $2,
          parameters = $3::jsonb,
          license = $4,
          keywords = $5,
          description = $6,
          authors = $7::jsonb,
          source = $8,
          year_from = $9,
          year_to = $10,
          changes = $11::jsonb,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [
        contentId,
        title,
        JSON.stringify(parameters),
        metadata.license || null,
        metadata.keywords || [],
        metadata.description || null,
        JSON.stringify(metadata.authors || []),
        metadata.source || null,
        metadata.yearFrom || null,
        metadata.yearTo || null,
        JSON.stringify(metadata.changes || [])
      ]);
    } catch (error) {
      console.error('Failed to update H5P content:', error);
      throw error;
    }
  }

  async deleteContent(contentId: string): Promise<void> {
    try {
      await this.initializeDatabase();
      // Cascade delete sẽ tự động xóa các bản ghi liên quan trong h5p_content_files và h5p_content_user_data
      await this.db.query('DELETE FROM h5p_contents WHERE id = $1', [contentId]);
    } catch (error) {
      console.error('Failed to delete H5P content:', error);
      throw error;
    }
  }

  async saveScore(
    contentId: string,
    user: IUser,
    score: number,
    maxScore: number,
    finished: boolean = true,
    timeSpent?: number,
    interactionPattern?: any,
    answers?: any
  ): Promise<void> {
    try {
      await this.initializeDatabase();

      // Validate input
      if (!contentId || !user || score < 0 || maxScore < 0) {
        throw new Error('Invalid score data');
      }

      // Lưu điểm vào database
      await this.db.query(`
        INSERT INTO h5p_content_scores (
          content_id, user_id, score, max_score, 
          finished, time_spent, interaction_pattern, answers
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb)
      `, [
        contentId,
        user.id,
        score,
        maxScore,
        finished,
        timeSpent || null,
        interactionPattern ? JSON.stringify(interactionPattern) : null,
        answers ? JSON.stringify(answers) : null
      ]);

      console.log(`Score saved for content ${contentId} by user ${user.id}`);
    } catch (error) {
      console.error('Failed to save score:', error);
      throw error;
    }
  }

  async getHighestScore(contentId: string, userId: string): Promise<H5PScore | null> {
    try {
      await this.initializeDatabase();
      
      const result = await this.db.query<H5PScore>(`
        SELECT 
          score,
          max_score,
          finished,
          time_spent,
          completion_time,
          interaction_pattern,
          answers
        FROM h5p_content_scores
        WHERE content_id = $1 AND user_id = $2
        ORDER BY score DESC, completion_time DESC
        LIMIT 1
      `, [contentId, userId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get highest score:', error);
      throw error;
    }
  }

  async getScoreHistory(contentId: string, userId: string): Promise<H5PScore[]> {
    try {
      await this.initializeDatabase();
      
      const result = await this.db.query<H5PScore>(`
        SELECT 
          score,
          max_score,
          finished,
          time_spent,
          completion_time,
          interaction_pattern,
          answers
        FROM h5p_content_scores
        WHERE content_id = $1 AND user_id = $2
        ORDER BY completion_time DESC
      `, [contentId, userId]);

      return result.rows;
    } catch (error) {
      console.error('Failed to get score history:', error);
      throw error;
    }
  }

  async getContentScoreStats(contentId: string): Promise<H5PScoreStats> {
    try {
      await this.initializeDatabase();
      
      const result = await this.db.query<H5PScoreStats>(`
        SELECT 
          COUNT(*) as total_attempts,
          AVG(score) as average_score,
          MAX(score) as highest_score,
          MIN(score) as lowest_score,
          AVG(time_spent) as average_time_spent
        FROM h5p_content_scores
        WHERE content_id = $1 AND finished = true
      `, [contentId]);

      return result.rows[0];
    } catch (error) {
      console.error('Failed to get content score stats:', error);
      throw error;
    }
  }
} 