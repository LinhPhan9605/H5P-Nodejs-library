import dotenv from 'dotenv';
import path from 'path';

import { UserService } from './UserService';
import { IUser } from '../types';

// Try loading from different possible locations
const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(__dirname, '../../.env')
];

for (const envPath of envPaths) {
    dotenv.config({ path: envPath });
}

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

export class LmsService {
    public async createOrUpdateContent(
        contentId: string,
        title: string,
        parameters: any,
        metadata: any = {},
        user: IUser
    ): Promise<void> {
        const apiUrl = `${process.env.VITE_LMS_API}/h5p/content`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Token: user.token || ''
                },
                body: JSON.stringify({
                    contentId,
                    title,
                    parameters,
                    metadata
                })
            });

            if (!response.ok) {
                const errorMessage = `Failed createOrUpdateContent to api: ${response.status} ${response.statusText}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error in createOrUpdateContent:', error);
            throw new Error(error);
        }
    }

    public async getContentUserData(
        contentId: string,
        dataType: string,
        subContentId: string,
        userId: string,
        contextId?: string
    ): Promise<any> {
        const apiUrl = `${process.env.VITE_LMS_API}/h5p/content-data/${contentId}/${userId}`;
        const user = UserService.getUser();

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Token: process.env.VITE_LMS_API_TOKEN || ''
            }
        });

        if (!response.ok) {
            const errorMessage = `Failed getContentUserData to api: ${response.status} ${response.statusText}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        const result = await response.json();

        const userData: ContentUserData = {
            contentId,
            contextId: contextId || '',
            dataType,
            invalidate: result.invalidate || false,
            preload: result.preload || false,
            subContentId,
            userState: result.user_state || '',
            userId
        };

        return userData;
    }

    public async getContentUserDataByContentIdAndUser(
        contentId: string,
        userId: string,
        contextId?: string
    ): Promise<any> {
        const apiUrl = `${process.env.VITE_LMS_API}/h5p/content-user-data/${contentId}/${userId}/context`;
        const user = UserService.getUser();

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Token: process.env.VITE_LMS_API_TOKEN || ''
                }
            });

            if (!response.ok) {
                const errorMessage = `Failed getContentUserDataByContentIdAndUser to api: ${response.status} ${response.statusText}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }

            const result = await response.json();

            return result.state;
        } catch (error) {
            console.error('Error in getContentUserDataByContentIdAndUser:', error);
            throw new Error(error);
        }
    }

    public async createOrUpdateContentUserData(
        data: ContentUserData
    ): Promise<void> {
        const user = UserService.getUser();
        const apiUrl = `${process.env.VITE_LMS_API}/h5p/content-user-data`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Token: process.env.VITE_LMS_API_TOKEN || ''
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorMessage = `Failed createOrUpdateContentUserData to api: ${response.status} ${response.statusText}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error in createOrUpdateContentUserData:', error);
            throw new Error(error);
        }
    }

    public async createOrUpdateContentScore(data: ContentScore): Promise<void> {
        const apiUrl = `${process.env.VITE_LMS_API}/h5p/content-score`;
        const user = UserService.getUser();

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Token: process.env.VITE_LMS_API_TOKEN || ''
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorMessage = `Failed createOrUpdateContentScore to api: ${response.status} ${response.statusText}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error in createOrUpdateContentScore:', error);
            throw new Error(error);
        }
    }

    public async getUserFromToken(token: string) {
        const apiUrl = `${process.env.VITE_LMS_API}/profile`;
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Token: token
                }
            });
            if (!response.ok) {
                const errorMessage = `Failed getUserFromToken to api: ${response.status} ${response.statusText}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }

            const result = await response.json();

            console.log(result)
            const userData = {
                id: result.data.id,
                name: result.data.name,
                email: result.data.email,
            };
            return userData;
        }
        catch (error) {
            console.error('Error in getUserFromToken:', error);
            throw new Error(error);
        }
    }
}
