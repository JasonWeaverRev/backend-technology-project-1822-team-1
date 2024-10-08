const commentDao = require('../src/backend/dao/commentDao');
const accountDao = require('../src/backend/dao/accountDao'); // Add accountDao for role checking
const commentService = require('../src/backend/service/commentService');

// Mock DAO functions
jest.mock('../src/backend/dao/commentDao');
jest.mock('../src/backend/dao/accountDao');

beforeEach(() => {
    jest.clearAllMocks(); // Clear all mock calls before each test
});

// Ensure proper cleanup after all tests
afterAll((done) => {
    done();
});

// Sample comment object
const sampleComment = {
    comment_id: 'c15fb317-2547-418c-81b4-7cc4aa2e0d4a',
    creation_time: '2024-10-04T19:28:21.285Z',
    body: 'This is the original comment',
    written_by: '1',
};

// Sample post object to use for testing delete comment in a post
const samplePost = {
    post_id: 'parent_post_id',
    creation_time: 'parent_post_creation_time',
    replies: ['comment_id']
};

// Mock functions
commentDao.getCommentById = jest.fn();
commentDao.updateCommentByUser = jest.fn();
commentDao.deleteCommentByUser = jest.fn();
accountDao.getUserRoleByUsername = jest.fn(); // Mock for user role

// ====== Tests for Updating Comment ======

describe('Comment Service - Update Comment', () => {
    test('Should update comment if user is the author', async () => {
        // Arrange
        commentDao.getCommentById.mockResolvedValueOnce(sampleComment);
        commentDao.updateCommentByUser.mockResolvedValueOnce(1);

        // Act
        const result = await commentService.updateComment(
            sampleComment.comment_id, 
            sampleComment.creation_time, 
            'Updated comment body', 
            sampleComment.written_by
        );

        // Assert
        expect(result).toBe(1);
        expect(commentDao.getCommentById).toHaveBeenCalledWith(sampleComment.comment_id, sampleComment.creation_time);
        expect(commentDao.updateCommentByUser).toHaveBeenCalledWith(sampleComment.comment_id, sampleComment.creation_time, 'Updated comment body');
    });

    test('Should return 403 if user is not the author', async () => {
        // Arrange: Mock the comment, but different author
        commentDao.getCommentById.mockResolvedValueOnce({ ...sampleComment, written_by: 'differentUser' });

        // Act
        const result = await commentService.updateComment(
            sampleComment.comment_id, 
            sampleComment.creation_time, 
            'Updated comment body', 
            sampleComment.written_by
        );

        // Assert
        expect(result).toBe(-1); // Unauthorized
        expect(commentDao.getCommentById).toHaveBeenCalledWith(sampleComment.comment_id, sampleComment.creation_time);
        expect(commentDao.updateCommentByUser).not.toHaveBeenCalled();
    });

    test('Should return 404 if comment not found', async () => {
        // Arrange: Comment not found
        commentDao.getCommentById.mockResolvedValueOnce(null);

        // Act
        const result = await commentService.updateComment(
            sampleComment.comment_id, 
            sampleComment.creation_time, 
            'Updated comment body', 
            sampleComment.written_by
        );

        // Assert
        expect(result).toBe(0); // Comment not found
        expect(commentDao.getCommentById).toHaveBeenCalledWith(sampleComment.comment_id, sampleComment.creation_time);
        expect(commentDao.updateCommentByUser).not.toHaveBeenCalled();
    });
});

// ====== Tests for Deleting Comment ======

// describe("Comment Service - Delete Comment", () => {
//     let username;

//     beforeEach(() => {
//         username = '1';
//         commentDao.getCommentById.mockClear();
//         commentDao.deleteCommentByUser.mockClear();
//         accountDao.getUserRoleByUsername.mockClear();
//     });

    // test("Should delete comment if user is the author", async () => {
    //     // Arrange
    //     commentDao.getCommentById.mockResolvedValueOnce(sampleComment);
    //     commentDao.deleteCommentByUser.mockResolvedValueOnce(1);

    //     // Act
    //     const result = await commentService.deleteComment(
    //         samplePost.post_id,            // Keep post_id for context
    //         samplePost.creation_time,      // Keep post creation_time for context
    //         sampleComment.comment_id,      // Use comment_id for deletion
    //         sampleComment.creation_time,   // Use comment creation_time for deletion
    //         username                       // username of the user
    //     );

    //     // Assert
    //     expect(result).toBe(1);  // Successfully deleted
    //     expect(commentDao.getCommentById).toHaveBeenCalledWith(sampleComment.comment_id, sampleComment.creation_time);  // Comment-specific values
    //     expect(commentDao.deleteCommentByUser).toHaveBeenCalledWith(
    //         sampleComment.comment_id,      // Correctly delete by comment_id
    //         sampleComment.creation_time    // and creation_time
    //     );
    // });

    // test("Should return 403 if user is not the author and not an admin", async () => {
    //     // Arrange
    //     commentDao.getCommentById.mockResolvedValueOnce({ ...sampleComment, written_by: 'differentUser' });
    //     accountDao.getUserRoleByUsername.mockResolvedValueOnce('user'); // Regular user

    //     // Act
    //     const result = await commentService.deleteComment(
    //         samplePost.post_id,
    //         samplePost.creation_time,
    //         sampleComment.comment_id,      // Use comment_id
    //         sampleComment.creation_time,   // Use comment_creation_time
    //         username
    //     );

    //     // Assert
    //     expect(result).toBe(-1);  // Unauthorized
    //     expect(commentDao.getCommentById).toHaveBeenCalledWith(sampleComment.comment_id, sampleComment.creation_time);  // Comment-specific values
    //     expect(commentDao.deleteCommentByUser).not.toHaveBeenCalled();  // Ensure no deletion happened
    //     expect(accountDao.getUserRoleByUsername).toHaveBeenCalledWith(username);  // Ensure role check is performed
    // });

    // test("Should delete comment if user is an admin", async () => {
    //     // Arrange
    //     // Simulate that the comment was written by someone else
    //     commentDao.getCommentById.mockResolvedValueOnce({ ...sampleComment, written_by: 'differentUser' });
    //     commentDao.deleteCommentByUser.mockResolvedValueOnce(1);
    //     accountDao.getUserRoleByUsername.mockResolvedValueOnce('admin'); // Admin user
    
    //     // Act
    //     const result = await commentService.deleteComment(
    //         samplePost.post_id,
    //         samplePost.creation_time,
    //         sampleComment.comment_id,
    //         sampleComment.creation_time,
    //         username // 'username' is '1', different from 'differentUser'
    //     );
    
    //     // Assert
    //     expect(result).toBe(1);  // Successfully deleted
    //     expect(commentDao.getCommentById).toHaveBeenCalledWith(
    //         sampleComment.comment_id,
    //         sampleComment.creation_time
    //     );
    //     expect(commentDao.deleteCommentByUser).toHaveBeenCalledWith(
    //         sampleComment.comment_id,
    //         sampleComment.creation_time
    //     );
    //     expect(accountDao.getUserRoleByUsername).toHaveBeenCalledWith(username);  // Ensure admin check is performed
    // });
    

    // test("Should return 404 if comment not found", async () => {
    //     // Arrange: Comment not found
    //     commentDao.getCommentById.mockResolvedValueOnce(null);
    
    //     // Act
    //     const result = await commentService.deleteComment(
    //         samplePost.post_id,
    //         samplePost.creation_time,
    //         sampleComment.comment_id,      // Use comment_id
    //         sampleComment.creation_time,   // Use comment_creation_time
    //         username
    //     );
    
    //     // Assert
    //     expect(result).toBe(0);  // Comment not found
    //     expect(commentDao.getCommentById).toHaveBeenCalledWith(sampleComment.comment_id, sampleComment.creation_time);  // Comment-specific values
    //     expect(commentDao.deleteCommentByUser).not.toHaveBeenCalled();  // Ensure no deletion happened
    //     expect(accountDao.getUserRoleByUsername).not.toHaveBeenCalled();  // No role check if comment not found
    // });
// });
