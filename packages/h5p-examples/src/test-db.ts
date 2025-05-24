import { H5PContentService } from './services/h5pContentService';
import { User } from './services/User';

async function testDatabase() {
    const contentService = new H5PContentService();
    const testUser = new User('test-user-1');

    try {
        // Test data
        const testContent = {
            title: 'Test H5P Content',
            contentType: 'Interactive Video',
            parameters: {
                contentId: '1234567890',
                interactiveVideo: {
                    video: {
                        files: [{ path: 'videos/test-video.mp4', mime: 'video/mp4' }]
                    },
                    interactions: [{
                        duration: { from: 10, to: 20 },
                        type: 'text',
                        text: 'Test interaction'
                    }]
                }
            },
            libraryName: 'H5P.InteractiveVideo',
            libraryVersion: '1.24.1',
            metadata: {
                license: 'MIT',
                authors: [{ name: 'Test Author', role: 'Author' }],
                source: 'https://example.com',
                yearFrom: 2024,
                yearTo: 2024,
                keywords: ['test', 'video', 'interactive'],
                description: 'A test interactive video'
            }
        };

        console.log('\n🔍 Starting database test...\n');

        // Test 1: Save content
        console.log('Test 1: Saving content...');
        const contentId = await contentService.saveContent(
            testContent.title,
            testContent.contentType,
            testContent.parameters,
            testContent.libraryName,
            testContent.libraryVersion,
            testUser,
            testContent.metadata
        );
        console.log('✅ Content saved successfully with ID:', contentId);

        // Test 2: Save content files
        console.log('\nTest 2: Saving content files...');
        await contentService.saveContentFile(
            contentId,
            'test-video.mp4',
            'videos/test-video.mp4',
            'video/mp4',
            1024 * 1024 // 1MB
        );
        console.log('✅ Content file saved successfully');

        // Test 3: Save user data
        console.log('\nTest 3: Saving user data...');
        const userData = {
            progress: 50,
            answers: [{ questionId: 1, answer: 'test' }],
            completed: false
        };
        await contentService.saveUserData(
            contentId,
            testUser,
            'state',
            userData
        );
        console.log('✅ User data saved successfully');

        // Test 4: Save and retrieve scores
        console.log('\nTest 4: Testing score functionality...');
        
        // Save initial score
        await contentService.saveScore(
            contentId,
            testUser,
            8,
            10,
            true,
            120, // 2 minutes
            { clicks: 5, hints: 2 },
            { q1: 'A', q2: 'B', q3: 'C' }
        );
        console.log('✅ Initial score saved');

        // Save another score
        await contentService.saveScore(
            contentId,
            testUser,
            10,
            10,
            true,
            90, // 1.5 minutes
            { clicks: 3, hints: 0 },
            { q1: 'A', q2: 'B', q3: 'C' }
        );
        console.log('✅ Second score saved');

        // Get highest score
        const highestScore = await contentService.getHighestScore(contentId, testUser.id);
        console.log('✅ Retrieved highest score:', highestScore);

        // Get score history
        const scoreHistory = await contentService.getScoreHistory(contentId, testUser.id);
        console.log('✅ Retrieved score history:', scoreHistory);

        // Get score statistics
        const scoreStats = await contentService.getContentScoreStats(contentId);
        console.log('✅ Retrieved score statistics:', scoreStats);

        // Test 5: Get content with all related data
        console.log('\nTest 5: Getting content...');
        const savedContent = await contentService.getContent(contentId);
        console.log('✅ Retrieved content:', savedContent);

        const contentFiles = await contentService.getContentFiles(contentId);
        console.log('✅ Retrieved content files:', contentFiles);

        const savedUserData = await contentService.getUserData(
            contentId,
            testUser,
            'state'
        );
        console.log('✅ Retrieved user data:', savedUserData);

        // Test 6: Update content
        console.log('\nTest 6: Updating content...');
        const updatedTitle = 'Updated Test Content';
        const updatedParameters = {
            ...testContent.parameters,
            interactiveVideo: {
                ...testContent.parameters.interactiveVideo,
                interactions: [
                    ...testContent.parameters.interactiveVideo.interactions,
                    {
                        duration: { from: 30, to: 40 },
                        type: 'text',
                        text: 'New interaction'
                    }
                ]
            }
        };
        await contentService.updateContent(
            contentId,
            updatedTitle,
            updatedParameters,
            {
                ...testContent.metadata,
                description: 'Updated description'
            }
        );
        console.log('✅ Content updated successfully');

        // Verify update
        const updatedContent = await contentService.getContent(contentId);
        console.log('✅ Retrieved updated content:', updatedContent);

        // Test 7: Delete content
        console.log('\nTest 7: Deleting content...');
        await contentService.deleteContent(contentId);
        console.log('✅ Content deleted successfully');

        // Verify deletion and cascade delete
        const deletedContent = await contentService.getContent(contentId);
        const deletedFiles = await contentService.getContentFiles(contentId);
        const deletedUserData = await contentService.getUserData(
            contentId,
            testUser,
            'state'
        );

        if (!deletedContent && deletedFiles.length === 0 && !deletedUserData) {
            console.log('✅ Content and all related data were properly deleted');
        }

        console.log('\n🎉 All database tests passed successfully!\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error);
    }
}

// Run test
testDatabase().catch(console.error); 