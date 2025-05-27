"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LmsService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Try loading from different possible locations
const envPaths = [
    path_1.default.resolve(process.cwd(), '.env'),
    path_1.default.resolve(process.cwd(), '../../.env'),
    path_1.default.resolve(__dirname, '../../.env')
];
for (const envPath of envPaths) {
    dotenv_1.default.config({ path: envPath });
}
class LmsService {
    async createOrUpdateContent(contentId, title, parameters, metadata = {}) {
        const apiUrl = `${process.env.VITE_LMS_API}/h5p/content`;
        const body = {
            contentId,
            title,
            parameters,
            metadata
        };
        console.log(body);
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
                console.error(`Failed to post data: ${response.statusText}`);
                return null;
            }
            console.log('Content created/updated successfully');
        }
        catch (error) {
            console.error('Error in createOrUpdateContent:', error);
            return null;
        }
    }
    async getContentUserData(contentId, dataType, subContentId, userId, contextId) {
        const apiUrl = `${process.env.VITE_LMS_API}/h5p/content-data/${contentId}/${userId}`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Token: process.env.VITE_LMS_API_TOKEN || ''
            }
        });
        if (!response.ok) {
            console.error(`Failed to post data: ${response.statusText}`);
            return null;
        }
        const result = await response.json();
        const userData = {
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
    async getContentUserDataByContentIdAndUser(contentId, userId, contextId) {
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
                console.error(`Failed to post data: ${response.statusText}`);
                return null;
            }
            const result = await response.json();
            return result.state;
        }
        catch (error) {
            console.error('Error in getContentUserDataByContentIdAndUser:', error);
            return null;
        }
    }
    async createOrUpdateContentUserData(data) {
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
                console.error(`Failed to post data: ${response.statusText}`);
                return null;
            }
        }
        catch (error) {
            console.error('Error in createOrUpdateContentUserData:', error);
            return null;
        }
    }
    async createOrUpdateContentScore(data) {
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
                console.error(`Failed to post data: ${response.statusText}`);
                return null;
            }
        }
        catch (error) {
            console.error('Error in createOrUpdateContentUserData:', error);
            return null;
        }
    }

    async getUserFromToken(token) {
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
                console.log(`Failed to get data: ${response.statusText}`);
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
            console.error('Error in createOrUpdateContentUserData:', error);
            return null;
        }
    }
}
exports.LmsService = LmsService;
//# sourceMappingURL=LmsService.js.map