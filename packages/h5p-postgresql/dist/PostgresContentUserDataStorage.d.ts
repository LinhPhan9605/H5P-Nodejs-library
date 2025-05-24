import { IContentUserData, IUser, IContentUserDataStorage } from '@LinhPhan9605/h5p-server';
import { DatabaseConfig } from './config';
export declare class PostgresContentUserDataStorage implements IContentUserDataStorage {
    private db;
    constructor(config: DatabaseConfig);
    createOrUpdateContentUserData(userData: IContentUserData): Promise<void>;
    getContentUserData(contentId: string, dataType: string, subContentId: string, userId: string, contextId?: string): Promise<IContentUserData>;
    deleteContentUserData(contentId: string, userId: string): Promise<void>;
    deleteAllContentUserDataByUser(user: IUser): Promise<void>;
    deleteInvalidatedContentUserDataByContentId(contentId: string): Promise<void>;
    deleteContentUserDataByContentId(contentId: string): Promise<void>;
    getContentUserDataByContentIdAndUser(contentId: string, userId: string): Promise<IContentUserData[]>;
    getContentUserDataByUser(user: IUser): Promise<IContentUserData[]>;
    deleteInvalidatedContentUserData(): Promise<void>;
    deleteAllContentUserDataByContentId(contentId: string): Promise<void>;
    createOrUpdateFinishedData(data: any): Promise<void>;
    getFinishedDataByContentId(contentId: string): Promise<any>;
    getFinishedDataByUser(user: IUser): Promise<any>;
    deleteFinishedDataByContentId(contentId: string): Promise<void>;
    deleteFinishedDataByUser(user: IUser): Promise<void>;
}
