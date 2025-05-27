import { LmsService } from '@LinhPhan9605/h5p-server/src/services/LmsService';
import { IUser } from '@LinhPhan9605/h5p-server/src/types';
import { UserService } from '@LinhPhan9605/h5p-server/src/services/UserService';

export class H5PContentService {
    async createOrUpdateContent(
        contentId: string,
        title: string,
        parameters: any,
        metadata: any = {},
        user: IUser
    ): Promise<void> {
        const contentService = new LmsService();
        await contentService.createOrUpdateContent(
            contentId,
            title,
            parameters,
            metadata,
            user
        );
    }

    async getUserFromToken(token: string): Promise<IUser> {
        const contentService = new LmsService();
        console.log('... getUserFromToken');
        const rawUser = await contentService.getUserFromToken(token);
        console.log('... getUserFromToken ok');

        console.log(rawUser);

        let user: IUser;

        if (!rawUser || !rawUser.id) {
            user = {
                email: 'email@example.com',
                id: '1',
                name: 'admin',
                type: 'local',
                token: token
            };
        } else {
            user = {
                email: rawUser.email || 'email@example.com',
                id: rawUser.id.toString(),
                name: rawUser.name || 'admin',
                type: 'local',
                token: token
            };
        }

        console.log('... setUser');
        UserService.setUser(user);
        console.log('... setUser ok');

        return user;
    }

    async getUserFormStorage(): Promise<IUser | null> {
        const user = UserService.getUser();
        return user;
    }
}
