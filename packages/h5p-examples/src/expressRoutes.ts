import express from 'express';

import * as H5P from '@LinhPhan9605/h5p-server';
import {
    IRequestWithUser,
    IRequestWithLanguage
} from '@LinhPhan9605/h5p-express';
import { H5PContentService } from './services/h5pContentService';
import { User } from './services/User';

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
                    new User(req.user.id || 'anonymous'),
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
        try {
            // Cập nhật content trong H5P system
            const contentId = await h5pEditor.saveOrUpdateContent(
                req.params.contentId.toString(),
                req.body.params.params,
                req.body.params.metadata,
                req.body.library,
                req.user
            );

            // Cập nhật content trong PostgreSQL
            await contentService.updateContent(
                contentId,
                req.body.params.metadata.title || 'Untitled Content',
                req.body.params.params,
                {
                    ...req.body.params.metadata,
                    changes: [
                        ...(req.body.params.metadata.changes || []),
                        {
                            date: new Date().toISOString(),
                            type: 'update',
                            userId: new User(req.user.id || 'anonymous')
                        }
                    ]
                }
            );

            res.send(JSON.stringify({ contentId }));
            res.status(200).end();
        } catch (error) {
            console.error('Error updating content:', error);
            res.status(500).send('Error updating content').end();
        }
    });

    router.get(
        '/new',
        async (req: IRequestWithLanguage & IRequestWithUser, res) => {
            const page = await h5pEditor.render(
                undefined,
                languageOverride === 'auto'
                    ? (req.language ?? 'en')
                    : languageOverride,
                req.user
            );
            res.send(page);
            res.status(200).end();
        }
    );

    router.post('/new', async (req: IRequestWithUser, res) => {
        // Validate request payload
        if (!req.body.library || !req.body.params || !req.user) {
            console.error('Invalid request payload:', req.body);
            res.status(400).send('Malformed request: Missing required fields').end();
            return;
        }

        try {
            // Parse library info from the string "H5P.GameMap 1.3" format
            const libraryParts = req.body.library.split(' ');
            if (libraryParts.length !== 2) {
                throw new Error(`Invalid library format: ${req.body.library}`);
            }
            const libraryName = libraryParts[0];
            
            // Xử lý version string cẩn thận hơn
            const versionStr = libraryParts[1];
            const versionParts = versionStr.split('.').map(part => {
                const num = parseInt(part, 10);
                if (isNaN(num)) {
                    throw new Error(`Invalid version number in ${versionStr}`);
                }
                return num;
            });

            if (versionParts.length < 2) {
                throw new Error(`Invalid version format: ${versionStr}. Expected at least major.minor`);
            }

            const [majorVersion, minorVersion] = versionParts;
            const patchVersion = versionParts[2] || 0; // Default patch to 0 if not provided

            // Extract metadata and params
            const metadata = req.body.params.metadata || {};
            const params = req.body.params.params || {};

            // Prepare additional information for database
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
                        userId: req.user.id || 'anonymous',
                        action: 'Content created'
                    }
                ]
            };

            // Log version information for debugging
            console.log('Version information:', {
                original: versionStr,
                major: majorVersion,
                minor: minorVersion,
                patch: patchVersion
            });

            // Lưu content vào H5P system
            let contentId;
            try {
                contentId = await h5pEditor.saveOrUpdateContent(
                    undefined,
                    params,
                    metadata,
                    req.body.library,
                    req.user
                );
                console.log('Successfully saved content to H5P system:', contentId);
            } catch (h5pError) {
                console.error('Failed to save content to H5P system:', h5pError);
                throw h5pError;
            }

            // Lưu content vào PostgreSQL với thông tin mở rộng
            try {
                const user = new User(req.user.id || 'anonymous');
                await contentService.saveContent(
                    metadata.title || 'Untitled Content',
                    libraryName.replace('H5P.', ''),
                    {
                        ...params,
                        contentId: contentId,
                        lastSaved: now
                    },
                    libraryName,
                    `${majorVersion}.${minorVersion}.${patchVersion}`,
                    user,
                    extendedMetadata
                );
                console.log('Successfully saved content to PostgreSQL with extended information');

                // Lưu thêm thông tin về file nếu có
                if (params.files) {
                    for (const file of params.files) {
                        await contentService.saveContentFile(
                            contentId,
                            file.name || 'unnamed',
                            file.path,
                            file.mime || 'application/octet-stream',
                            file.size || 0
                        );
                    }
                    console.log('Successfully saved content files information');
                }

                // Lưu thông tin người dùng
                await contentService.saveUserData(
                    contentId,
                    user,
                    'content_state',
                    {
                        lastAccessed: now,
                        created: now,
                        status: 'active'
                    }
                );
                console.log('Successfully saved user data');

            } catch (dbError) {
                console.error('Failed to save content to PostgreSQL:', dbError);
                // Try to rollback H5P content if PostgreSQL save fails
                try {
                    await h5pEditor.deleteContent(contentId, req.user);
                    console.log('Rolled back H5P content after PostgreSQL save failure');
                } catch (rollbackError) {
                    console.error('Failed to rollback H5P content:', rollbackError);
                }
                throw dbError;
            }

            res.send(JSON.stringify({ 
                contentId,
                status: 'success',
                message: 'Content saved successfully',
                timestamp: now
            }));
            res.status(200).end();
        } catch (error) {
            console.error('Error in /new route:', error);
            res.status(500).send(`Error saving content: ${error.message}`).end();
        }
    });

    // Route để submit điểm
    router.post('/content/:contentId/score', async (req: IRequestWithUser, res) => {
        try {
            const { contentId } = req.params;
            const {
                score,
                maxScore,
                finished,
                timeSpent,
                interactionPattern,
                answers
            } = req.body;

            if (typeof score !== 'number' || typeof maxScore !== 'number') {
                res.status(400).send('Invalid score data').end();
                return;
            }

            await contentService.saveScore(
                contentId,
                req.user,
                score,
                maxScore,
                finished,
                timeSpent,
                interactionPattern,
                answers
            );

            // Lấy thông tin điểm cao nhất
            const highestScore = await contentService.getHighestScore(contentId, req.user.id);

            res.json({
                success: true,
                message: 'Score saved successfully',
                currentScore: {
                    score,
                    maxScore,
                    percentage: (score / maxScore) * 100,
                    timeSpent
                },
                highestScore
            });
        } catch (error) {
            console.error('Error saving score:', error);
            res.status(500).send(`Error saving score: ${error.message}`).end();
        }
    });

    // Route để lấy điểm cao nhất
    router.get('/content/:contentId/highscore', async (req: IRequestWithUser, res) => {
        try {
            const { contentId } = req.params;
            const highestScore = await contentService.getHighestScore(contentId, req.user.id);
            res.json(highestScore);
        } catch (error) {
            console.error('Error getting highest score:', error);
            res.status(500).send(`Error getting highest score: ${error.message}`).end();
        }
    });

    // Route để lấy lịch sử điểm
    router.get('/content/:contentId/scores', async (req: IRequestWithUser, res) => {
        try {
            const { contentId } = req.params;
            const scores = await contentService.getScoreHistory(contentId, req.user.id);
            res.json(scores);
        } catch (error) {
            console.error('Error getting score history:', error);
            res.status(500).send(`Error getting score history: ${error.message}`).end();
        }
    });

    // Route để lấy thống kê điểm của content
    router.get('/content/:contentId/stats', async (req: IRequestWithUser, res) => {
        try {
            const { contentId } = req.params;
            const stats = await contentService.getContentScoreStats(contentId);
            res.json(stats);
        } catch (error) {
            console.error('Error getting content stats:', error);
            res.status(500).send(`Error getting content stats: ${error.message}`).end();
        }
    });

    router.get('/delete/:contentId', async (req: IRequestWithUser, res) => {
        try {
            // Xóa content từ H5P system
            await h5pEditor.deleteContent(req.params.contentId, req.user);
            
            // Xóa content từ PostgreSQL
            await contentService.deleteContent(req.params.contentId);

            res.send(
                `Content ${req.params.contentId} successfully deleted.<br/><a href="javascript:window.location=document.referrer">Go Back</a>`
            );
            res.status(200).end();
        } catch (error) {
            res.send(
                `Error deleting content with id ${req.params.contentId}: ${error.message}<br/><a href="javascript:window.location=document.referrer">Go Back</a>`
            );
            res.status(500).end();
        }
    });

    // H5P contentUserData route
    router.post('/h5p/contentUserData/:contentId/:dataType/:subContentId?', async (req: IRequestWithUser, res) => {
        try {
            const { contentId, dataType, subContentId } = req.params;
            const data = req.body;
            
            // Debug logs
            console.log('=== Content User Data Save Request ===');
            console.log('Path params:', { contentId, dataType, subContentId });
            console.log('Request body:', data);
            console.log('User:', req.user);

            // Validate contentId
            if (!contentId) {
                throw new Error('Content ID is required');
            }

            // Lưu user data
            await contentService.saveUserData(
                contentId,
                new User(req.user?.id || 'anonymous'),
                dataType,
                data,
                subContentId ? parseInt(subContentId) : null
            );
            console.log('✅ User data saved successfully');

            // Nếu là state data và có score, lưu điểm
            if (dataType === 'state' && data.score !== undefined) {
                await contentService.saveScore(
                    contentId,
                    new User(req.user?.id || 'anonymous'),
                    data.score,
                    data.maxScore || data.score,
                    data.finished !== undefined ? data.finished : true,
                    data.time || null,
                    {
                        interactions: data.interactions || [],
                        answers: data.answers || [],
                        attempts: data.attempts || 1
                    },
                    data.answers || null
                );
                console.log('✅ Score saved successfully');
            }

            res.json({
                success: true
            });
        } catch (error) {
            console.error('❌ Error saving content user data:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // H5P contentUserData GET route
    router.get('/h5p/contentUserData/:contentId/:dataType/:subContentId?', async (req: IRequestWithUser, res) => {
        try {
            const { contentId, dataType, subContentId } = req.params;
            
            // Debug logs
            console.log('=== Content User Data Get Request ===');
            console.log('Path params:', { contentId, dataType, subContentId });
            console.log('User:', req.user);

            const data = await contentService.getUserData(
                contentId,
                new User(req.user?.id || 'anonymous'),
                dataType,
                subContentId ? parseInt(subContentId) : null
            );
            console.log('Retrieved data:', data);

            // If requesting state data, also get the highest score
            if (dataType === 'state') {
                const highestScore = await contentService.getHighestScore(contentId, req.user?.id || 'anonymous');
                if (highestScore) {
                    const response = {
                        ...data,
                        highestScore: {
                            score: highestScore.score,
                            maxScore: highestScore.max_score,
                            finished: highestScore.finished,
                            time: highestScore.time_spent
                        }
                    };
                    console.log('Response with highest score:', response);
                    res.json(response);
                    return;
                }
            }

            res.json(data || {});
        } catch (error) {
            console.error('❌ Error getting content user data:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    return router;
}
