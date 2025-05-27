import { LmsService } from '@LinhPhan9605/h5p-server/src/services/LmsService';
import { IUser } from '@LinhPhan9605/h5p-server/src/types';

export class H5PContentService {
    async createOrUpdateContent(
        contentId: string,
        title: string,
        parameters: any,
        metadata: any = {}
    ): Promise<void> {
        const contentService = new LmsService();
        await contentService.createOrUpdateContent(
            contentId,
            title,
            parameters,
            metadata
        );
    }

    async getUserFromToken(
        token: string
    ): Promise<IUser> {
        const contentService = new LmsService();
        const rawUser = await contentService.getUserFromToken(token);

        const user: IUser = {
            email: rawUser.email,
            id: rawUser.id.toString(),
            name: rawUser.name,
            type: 'local',
        };

        return user;
    }
}
