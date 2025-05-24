import {
    ContentUserDataManager,
    IContentUserData,
    IUser,
    IContentUserDataStorage,
    IPermissionSystem
} from '@LinhPhan9605/h5p-server';
import { ContentUserDataService } from '../../services/ContentUserDataService';

/**
 * Stores content user data in PostgreSQL database
 */
export default class PostgresContentUserDataStorage extends ContentUserDataManager {
    private contentUserDataService: ContentUserDataService;
    public contentUserDataStorage: IContentUserDataStorage;
    public permissionSystem: IPermissionSystem;

    constructor(contentUserDataStorage: IContentUserDataStorage, permissionSystem: IPermissionSystem) {
        super(contentUserDataStorage, permissionSystem);
        this.contentUserDataService = new ContentUserDataService();
        this.contentUserDataStorage = contentUserDataStorage;
        this.permissionSystem = permissionSystem;
    }

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
        await this.contentUserDataService.createOrUpdateContentUserData(
            contentId,
            dataType,
            subContentId,
            data,
            invalidate,
            preload,
            user
        );
    }

    /**
     * Gets user data for a specific content
     */
    public async getContentUserData(
        contentId: string,
        dataType: string,
        subContentId: string | null,
        user: IUser
    ): Promise<IContentUserData | null> {
        const data = await this.contentUserDataService.getContentUserData(
            contentId,
            dataType,
            subContentId,
            user
        );

        if (!data) {
            return null;
        }

        return {
            contentId,
            dataType,
            subContentId,
            userId: user.id,
            userState: data,
            preload: data.preload,
            invalidate: data.invalidate
        };
    }

    /**
     * Gets all user data for a specific content
     */
    public async getAllContentUserData(
        contentId: string,
        user: IUser
    ): Promise<IContentUserData[]> {
        const allData = await this.contentUserDataService.getAllContentUserData(
            contentId,
            user
        );

        return allData.map(data => ({
            contentId,
            dataType: data.dataType,
            subContentId: data.subContentId,
            userId: user.id,
            userState: data.data,
            preload: data.preload,
            invalidate: data.invalidate
        }));
    }

    /**
     * Deletes user data for a specific content
     */
    public async deleteContentUserData(
        contentId: string,
        user: IUser
    ): Promise<void> {
        await this.contentUserDataService.deleteContentUserData(contentId, user);
    }

    /**
     * Deletes all user data for a user
     */
    public async deleteAllContentUserDataByUser(user: IUser): Promise<void> {
        // Implement if needed
    }

    /**
     * Deletes invalidated content user data by content id
     */
    public async deleteInvalidatedContentUserDataByContentId(contentId: string): Promise<void> {
        // Implement if needed
    }

    /**
     * Deletes content user data by content id
     */
    public async deleteContentUserDataByContentId(contentId: string): Promise<void> {
        // Implement if needed
    }
} 