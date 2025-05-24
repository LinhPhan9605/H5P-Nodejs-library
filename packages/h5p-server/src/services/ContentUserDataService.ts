import { IUser } from '@LinhPhan9605/h5p-server';
import ContentUserData from '../models/ContentUserData';

export class ContentUserDataService {
    /**
     * Creates or updates user data for a specific content
     */
    public async createOrUpdateContentUserData(
        contentId: string,
        dataType: string,
        subContentId: string | null,
        data: any,
        invalidate: boolean,
        preload: boolean,
        user: IUser
    ): Promise<void> {
        try {
            const [userDataRecord, created] = await ContentUserData.findOrCreate({
                where: {
                    content_id: contentId,
                    user_id: user.id,
                    data_type: dataType,
                    sub_content_id: subContentId ? parseInt(subContentId) : null
                },
                defaults: {
                    data,
                    invalidate,
                    preload
                }
            });

            if (!created) {
                await userDataRecord.update({
                    data,
                    invalidate,
                    preload,
                    updated_at: new Date()
                });
            }

            console.log(`✅ User data ${created ? 'created' : 'updated'} successfully`);
        } catch (error) {
            console.error('❌ Error saving content user data:', error);
            throw error;
        }
    }

    /**
     * Gets user data for a specific content
     */
    public async getContentUserData(
        contentId: string,
        dataType: string,
        subContentId: string | null,
        user: IUser
    ): Promise<any> {
        try {
            const userDataRecord = await ContentUserData.findOne({
                where: {
                    content_id: contentId,
                    user_id: user.id,
                    data_type: dataType,
                    sub_content_id: subContentId ? parseInt(subContentId) : null
                }
            });

            if (!userDataRecord) {
                return null;
            }

            return userDataRecord.data;
        } catch (error) {
            console.error('❌ Error getting content user data:', error);
            throw error;
        }
    }

    /**
     * Gets all user data for a specific content
     */
    public async getAllContentUserData(
        contentId: string,
        user: IUser
    ): Promise<any[]> {
        try {
            const userDataRecords = await ContentUserData.findAll({
                where: {
                    content_id: contentId,
                    user_id: user.id
                }
            });

            return userDataRecords.map(record => ({
                dataType: record.data_type,
                subContentId: record.sub_content_id,
                data: record.data,
                preload: record.preload,
                invalidate: record.invalidate
            }));
        } catch (error) {
            console.error('❌ Error getting all content user data:', error);
            throw error;
        }
    }

    /**
     * Deletes user data for a specific content
     */
    public async deleteContentUserData(
        contentId: string,
        user: IUser
    ): Promise<void> {
        try {
            await ContentUserData.destroy({
                where: {
                    content_id: contentId,
                    user_id: user.id
                }
            });

            console.log('✅ User data deleted successfully');
        } catch (error) {
            console.error('❌ Error deleting content user data:', error);
            throw error;
        }
    }
} 