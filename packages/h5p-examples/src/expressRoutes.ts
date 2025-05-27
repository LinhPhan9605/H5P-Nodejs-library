import express from 'express';

import * as H5P from '@LinhPhan9605/h5p-server';
import {
    IRequestWithUser,
    IRequestWithLanguage
} from '@LinhPhan9605/h5p-express';

import { H5PContentService } from './services/h5pContentService';

/**
 * @param h5pEditor
 * @param h5pPlayer
 * @param languageOverride the language to use. Set it to 'auto' to use the
 * language set by a language detector in the req.language property.
 * (recommended)
 */
export default function (
    h5pEditor: H5P.H5PEditor,
    h5pPlayer: H5P.H5PPlayer,
    languageOverride: string | 'auto' = 'auto'
): express.Router {
    const router = express.Router();
    const contentService = new H5PContentService();

    router.get(
        `${h5pEditor.config.playUrl}/:contentId`,
        async (req: IRequestWithUser, res) => {
            try {
                const h5pPage = await h5pPlayer.render(
                    req.params.contentId,
                    req.user,
                    languageOverride === 'auto'
                        ? (req.language ?? 'en')
                        : languageOverride,
                    {
                        showCopyButton: true,
                        showDownloadButton: true,
                        showFrame: true,
                        showH5PIcon: true,
                        showLicenseButton: true,
                        contextId:
                            typeof req.query.contextId === 'string'
                                ? req.query.contextId
                                : undefined,
                        asUserId:
                            typeof req.query.asUserId === 'string'
                                ? req.query.asUserId
                                : undefined,
                        readOnlyState:
                            typeof req.query.readOnlyState === 'string'
                                ? req.query.readOnlyState === 'yes'
                                : undefined
                    }
                );
                res.send(h5pPage);
                res.status(200).end();
            } catch (error) {
                res.status(500).end(error.message);
            }
        }
    );

    router.get(
        '/edit/:contentId',
        async (req: IRequestWithLanguage & IRequestWithUser, res) => {
            const page = await h5pEditor.render(
                req.params.contentId,
                languageOverride === 'auto'
                    ? (req.language ?? 'en')
                    : languageOverride,
                req.user
            );
            res.send(page);
            res.status(200).end();
        }
    );

    router.post('/edit/:contentId', async (req: IRequestWithUser, res) => {
        const contentId = await h5pEditor.saveOrUpdateContent(
            req.params.contentId.toString(),
            req.body.params.params,
            req.body.params.metadata,
            req.body.library,
            req.user
        );

        res.send(JSON.stringify({ contentId }));
        res.status(200).end();
    });

    router.get(
        '/new',
        async (req: IRequestWithLanguage & IRequestWithUser, res) => {

            const token = req.query.token as string;

            console.log("token")
            console.log(token)

            const user = await contentService.getUserFromToken(token)
            
            console.log("get new content")
            console.log(user)

            const page = await h5pEditor.render(
                undefined,
                languageOverride === 'auto'
                    ? (req.language ?? 'en')
                    : languageOverride,
                user
            );
            res.send(page);
            res.status(200).end();
        }
    );

    router.post('/new', async (req: IRequestWithUser, res) => {
        console.log("new content")
        if (!req.body.library || !req.body.params || !req.user) {
            console.error('Invalid request payload:', req.body);
            res.status(400)
                .send('Malformed request: Missing required fields')
                .end();
            return;
        }

        try {
            const libraryParts = req.body.library.split(' ');
            if (libraryParts.length !== 2) {
                throw new Error(`Invalid library format: ${req.body.library}`);
            }
            const libraryName = libraryParts[0];

            const versionStr = libraryParts[1];
            const versionParts = versionStr.split('.').map((part) => {
                const num = parseInt(part, 10);
                if (isNaN(num)) {
                    throw new Error(`Invalid version number in ${versionStr}`);
                }
                return num;
            });

            if (versionParts.length < 2) {
                throw new Error(
                    `Invalid version format: ${versionStr}. Expected at least major.minor`
                );
            }

            const [majorVersion, minorVersion] = versionParts;
            const patchVersion = versionParts[2] || 0;

            const metadata = req.body.params.metadata || {};
            const params = req.body.params.params || {};

            const token = req.query.token as string;
            const user = await contentService.getUserFromToken(token)

            console.log("new content - user")
            console.log(user)

            const now = new Date().toISOString();
            const extendedMetadata = {
                ...metadata,
                created_at: now,
                updated_at: now,
                status: 'published',
                content_type: libraryName.replace('H5P.', ''),
                version: `${majorVersion}.${minorVersion}.${patchVersion}`,
                language: metadata.defaultLanguage || 'en',
                changes: [
                    ...(metadata.changes || []),
                    {
                        date: now,
                        type: 'create',
                        userId: user.id || 'anonymous',
                        action: 'Content created'
                    }
                ]
            };

            let contentId;
            try {
                contentId = await h5pEditor.saveOrUpdateContent(
                    undefined,
                    params,
                    metadata,
                    req.body.library,
                    user
                );
                console.log(
                    'Successfully saved content to H5P system:',
                    contentId
                );
            } catch (h5pError) {
                console.error(
                    'Failed to save content to H5P system:',
                    h5pError
                );
                throw h5pError;
            }

            console.log("createOrUpdateContent")
            
            await contentService.createOrUpdateContent(
                contentId,
                metadata.title || 'Untitled Content',
                params,
                extendedMetadata,
                user
            );

            res.send(
                JSON.stringify({
                    contentId,
                    status: 'success',
                    message: 'Content saved successfully',
                    timestamp: now,
                    token
                })
            );
            res.status(200).end();
        } catch (error) {
            console.error('Error in /new route:', error);
            res.status(500)
                .send(`Error saving content: ${error.message}`)
                .end();
        }
    });

    router.get('/delete/:contentId', async (req: IRequestWithUser, res) => {
        try {
            await h5pEditor.deleteContent(req.params.contentId, req.user);
        } catch (error) {
            res.send(
                `Error deleting content with id ${req.params.contentId}: ${error.message}<br/><a href="javascript:window.location=document.referrer">Go Back</a>`
            );
            res.status(500).end();
            return;
        }

        res.send(
            `Content ${req.params.contentId} successfully deleted.<br/><a href="javascript:window.location=document.referrer">Go Back</a>`
        );
        res.status(200).end();
    });

    return router;
}
