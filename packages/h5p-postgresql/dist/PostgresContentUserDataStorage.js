"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresContentUserDataStorage = void 0;
const index_1 = __importDefault(require("./index"));
class PostgresContentUserDataStorage {
    constructor(config) {
        console.log('Initializing PostgreSQL Content User Data Storage with config:', config);
        this.db = new index_1.default(config);
    }
    async createOrUpdateContentUserData(userData) {
        if (!userData.contentId) {
            throw new Error('Content ID is required');
        }
        console.log('Creating/Updating content user data:', userData);
        const query = `
            INSERT INTO h5p_content_user_data 
            (content_id, user_id, sub_content_id, data_type, data, preload, invalidate)
            VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
            ON CONFLICT (content_id, user_id, sub_content_id, data_type)
            DO UPDATE SET 
                data = $5::jsonb,
                preload = $6,
                invalidate = $7,
                updated_at = CURRENT_TIMESTAMP
        `;
        try {
            await this.db.query(query, [
                parseInt(userData.contentId),
                userData.userId,
                userData.subContentId ? parseInt(userData.subContentId) : null,
                userData.dataType,
                JSON.stringify(userData.userState),
                userData.preload || false,
                userData.invalidate || false
            ]);
            console.log('Successfully saved content user data');
        }
        catch (error) {
            console.error('Error saving content user data:', error);
            throw error;
        }
    }
    async getContentUserData(contentId, dataType, subContentId, userId, contextId) {
        if (!contentId) {
            throw new Error('Content ID is required');
        }
        const query = `
            SELECT * FROM h5p_content_user_data
            WHERE content_id = $1 
            AND user_id = $2 
            AND data_type = $3 
            AND sub_content_id = $4
        `;
        const result = await this.db.query(query, [
            parseInt(contentId),
            userId,
            dataType,
            subContentId ? parseInt(subContentId) : null
        ]);
        if (result.rows.length === 0) {
            throw new Error('Content user data not found');
        }
        const row = result.rows[0];
        return {
            contentId: row.content_id.toString(),
            dataType: row.data_type,
            subContentId: row.sub_content_id ? row.sub_content_id.toString() : null,
            userId: row.user_id,
            userState: row.data,
            preload: row.preload,
            invalidate: row.invalidate
        };
    }
    async deleteContentUserData(contentId, userId) {
        const query = `
            DELETE FROM h5p_content_user_data
            WHERE content_id = $1 AND user_id = $2
        `;
        await this.db.query(query, [contentId, userId]);
    }
    async deleteAllContentUserDataByUser(user) {
        const query = `
            DELETE FROM h5p_content_user_data
            WHERE user_id = $1
        `;
        await this.db.query(query, [user.id]);
    }
    async deleteInvalidatedContentUserDataByContentId(contentId) {
        const query = `
            DELETE FROM h5p_content_user_data
            WHERE content_id = $1 AND invalidate = true
        `;
        await this.db.query(query, [contentId]);
    }
    async deleteContentUserDataByContentId(contentId) {
        const query = `
            DELETE FROM h5p_content_user_data
            WHERE content_id = $1
        `;
        await this.db.query(query, [contentId]);
    }
    async getContentUserDataByContentIdAndUser(contentId, userId) {
        const query = `
            SELECT * FROM h5p_content_user_data
            WHERE content_id = $1 AND user_id = $2
        `;
        const result = await this.db.query(query, [contentId, userId]);
        return result.rows.map(row => ({
            contentId,
            dataType: row.data_type,
            subContentId: row.sub_content_id,
            userId,
            userState: row.data,
            preload: row.preload,
            invalidate: row.invalidate
        }));
    }
    async getContentUserDataByUser(user) {
        const query = `
            SELECT * FROM h5p_content_user_data
            WHERE user_id = $1
        `;
        const result = await this.db.query(query, [user.id]);
        return result.rows.map(row => ({
            contentId: row.content_id,
            dataType: row.data_type,
            subContentId: row.sub_content_id,
            userId: user.id,
            userState: row.data,
            preload: row.preload,
            invalidate: row.invalidate
        }));
    }
    async deleteInvalidatedContentUserData() {
        const query = `
            DELETE FROM h5p_content_user_data
            WHERE invalidate = true
        `;
        await this.db.query(query);
    }
    async deleteAllContentUserDataByContentId(contentId) {
        const query = `
            DELETE FROM h5p_content_user_data
            WHERE content_id = $1
        `;
        await this.db.query(query, [contentId]);
    }
    async createOrUpdateFinishedData(data) {
        throw new Error('Method not implemented: createOrUpdateFinishedData');
    }
    async getFinishedDataByContentId(contentId) {
        throw new Error('Method not implemented: getFinishedDataByContentId');
    }
    async getFinishedDataByUser(user) {
        throw new Error('Method not implemented: getFinishedDataByUser');
    }
    async deleteFinishedDataByContentId(contentId) {
        throw new Error('Method not implemented: deleteFinishedDataByContentId');
    }
    async deleteFinishedDataByUser(user) {
        throw new Error('Method not implemented: deleteFinishedDataByUser');
    }
}
exports.PostgresContentUserDataStorage = PostgresContentUserDataStorage;
