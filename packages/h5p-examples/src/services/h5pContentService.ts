import { LmsService } from '@LinhPhan9605/h5p-server/src/services/LmsService';

export class H5PContentService {
    async createOrUpdateContent(
        contentId: string,
        title: string,
        parameters: any,
        metadata: any = {}
    ): Promise<void> {

        console.log("H5PContentService createOrUpdateContent")
        const contentService = new LmsService();
        await contentService.createOrUpdateContent(
            contentId,
            title,
            parameters,
            metadata
        );
    }
}
