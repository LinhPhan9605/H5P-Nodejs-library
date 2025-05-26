export interface ContentUserData {
    contentId: string;
    contextId: string;
    dataType: string;
    invalidate: boolean;
    preload: boolean;
    subContentId: string;
    userState: object;
    userId: string;
}
export interface ContentScore {
    contentId: string;
    score: number;
    maxScore: number;
    opened: number;
    finished: number;
    userId: string;
}
export declare class LmsService {
    createOrUpdateContent(contentId: string, title: string, parameters: any, metadata?: any): Promise<void>;
    getContentUserData(contentId: string, dataType: string, subContentId: string, userId: string, contextId?: string): Promise<any>;
    getContentUserDataByContentIdAndUser(contentId: string, userId: string, contextId?: string): Promise<any>;
    createOrUpdateContentUserData(data: ContentUserData): Promise<void>;
    createOrUpdateContentScore(data: ContentScore): Promise<void>;
}
