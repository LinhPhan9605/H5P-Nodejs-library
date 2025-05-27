import dotenv from 'dotenv';
import path from 'path';

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
        metadata: any = {}
    ): Promise<void> {
        const apiUrl = `${process.env.VITE_LMS_API}/h5p/content`;
        console.log('Calling LMS API:', apiUrl);

        const body = {
            contentId,
            title,
            parameters,
            metadata
        };

        console.log(body)

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Token: process.env.VITE_LMS_API_TOKEN || ''
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                console.log(`Failed api: ${response.statusText}`);
                return null;
            }

            console.log('Content created/updated successfully');
        } catch (error) {
            console.error('Error api:', error);
            return null;
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

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Token: process.env.VITE_LMS_API_TOKEN || ''
            }
        });

        if (!response.ok) {
            console.log(`Failed api: ${response.statusText}`);
            return null;
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

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Token: process.env.VITE_LMS_API_TOKEN || ''
                }
            });

            if (!response.ok) {
                console.log(`Failed api: ${response.statusText}`);
                return null;
            }

            const result = await response.json();

            return result.state;
        } catch (error) {
            console.error('Error api:', error);
            return null;
        }
    }

    public async createOrUpdateContentUserData(
        data: ContentUserData
    ): Promise<void> {
        if (!process.env.VITE_LMS_API) {
            throw new Error(
                'VITE_LMS_API environment variable is not defined. Current working directory: ' +
                    process.cwd()
            );
        }

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
                console.log(`Failed api: ${response.statusText}`);
                return null;
            }
        } catch (error) {
            console.error('Error api:', error);
            return null;
        }
    }

    public async createOrUpdateContentScore(data: ContentScore): Promise<void> {
        const apiUrl = `${process.env.VITE_LMS_API}/h5p/content-score`;

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
                console.log(`Failed api: ${response.statusText}`);
                return null;
            }
        } catch (error) {
            console.error('Error api:', error);
            return null;
        }
    }
    public async getUserFromToken(token) {
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
                console.log(`Failed api: ${response.statusText}`);
                return null;
            }

            const result = await response.json();
            const userData = {
                id: result.id,
                name: result.name,
                email: result.email,
            };
            return userData;
        }
        catch (error) {
            console.error('Error api:', error);
            return null;
        }
    }
}
