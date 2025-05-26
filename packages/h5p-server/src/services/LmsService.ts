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

console.log('Process CWD:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Environment variables:', {
    VITE_LMS_API: process.env.VITE_LMS_API,
    VITE_LMS_API_TOKEN: process.env.VITE_LMS_API_TOKEN
});

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
    public async getContentUserData(
        contentId: string,
        dataType: string,
        subContentId: string,
        userId: string,
        contextId?: string
    ): Promise<any> {
        if (!process.env.VITE_LMS_API) {
            throw new Error(
                'VITE_LMS_API environment variable is not defined.'
            );
        }

        const apiUrl = `${process.env.VITE_LMS_API}/h5p/content-data/${contentId}/${userId}`;
        console.log('Calling LMS API:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Token: process.env.VITE_LMS_API_TOKEN || ''
            }
        });

        if (!response.ok) {
            throw new Error(
                `Failed to get content user data: ${response.statusText}`
            );
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
        if (!process.env.VITE_LMS_API) {
            throw new Error(
                'VITE_LMS_API environment variable is not defined.'
            );
        }

        const apiUrl = `${process.env.VITE_LMS_API}/h5p/content-user-data/${contentId}/${userId}/context`;
        console.log('Fetching content user data from LMS API:', apiUrl);

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Token: process.env.VITE_LMS_API_TOKEN || ''
                }
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to get content user data: ${response.statusText}`
                );
            }

            const result = await response.json();

            console.log(result)

            return result.state;
        } catch (error) {
            console.error(
                'Error in getContentUserDataByContentIdAndUser:',
                error
            );
            throw error;
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
        console.log('Attempting to call API URL:', apiUrl);

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
                throw new Error(`Failed to post data: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error in createOrUpdateContentUserData:', error);
            throw error;
        }
    }

    public async createOrUpdateContentScore(
        data: ContentScore
    ): Promise<void> {
        if (!process.env.VITE_LMS_API) {
            throw new Error(
                'VITE_LMS_API environment variable is not defined. Current working directory: ' +
                    process.cwd()
            );
        }

        const apiUrl = `${process.env.VITE_LMS_API}/h5p/content-score`;
        console.log('Attempting to call API URL:', apiUrl);

        console.log(data)

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
                throw new Error(`Failed to post data: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error in createOrUpdateContentUserData:', error);
            throw error;
        }
    }
}
