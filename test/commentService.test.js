const commentDao = require('../src/backend/dao/commentDao');
const accountDao = require('../src/backend/dao/accountDAO'); // Add accountDao for role checking
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

describe("Comment Service - Delete Comment", () => {
    let username;

    beforeEach(() => {
        username = '1'; // Simulating a logged-in user with ID '1'
        jest.clearAllMocks(); // Clears all mocks
    });

    const sampleComment = {
        post_id: 'sample-comment-id',
        creation_time: '2024-10-04T17:35:39.984Z',
        written_by: '1', // Assuming the author is '1'
        body: 'This is a comment',
        parentID: 'sample-post-id' // Reference to the parent post
    };

    test("Should delete comment if user is the author", async () => {
        // Arrange: Simulate that the comment belongs to the user
        commentDao.getCommentById.mockResolvedValueOnce(sampleComment);
        commentDao.deleteCommentByUser.mockResolvedValueOnce(1);

        // Act: Call the deleteComment function
        const result = await commentService.deleteComment(
            sampleComment.post_id,         // post_id of the comment to delete
            sampleComment.creation_time,   // creation_time of the comment to delete
            username                       // username of the user
        );

        // Assert: Ensure successful deletion
        expect(result).toBe(1);  // Successfully deleted
        expect(commentDao.getCommentById).toHaveBeenCalledWith(
            sampleComment.post_id,
            sampleComment.creation_time
        );
        expect(commentDao.deleteCommentByUser).toHaveBeenCalledWith(
            sampleComment.post_id,
            sampleComment.creation_time
        );
    });

    test("Should return 403 if user is not the author and not an admin", async () => {
        // Arrange: Mock the comment being written by a different user and user not being admin
        commentDao.getCommentById.mockResolvedValueOnce({ ...sampleComment, written_by: 'differentUser' });
        accountDao.getUserRoleByUsername.mockResolvedValueOnce('user'); // Regular user

        // Act: Call the deleteComment function
        const result = await commentService.deleteComment(
            sampleComment.post_id,
            sampleComment.creation_time,
            username
        );

        // Assert: Ensure unauthorized (403) response
        expect(result).toBe(-1);  // Unauthorized
        expect(commentDao.getCommentById).toHaveBeenCalledWith(
            sampleComment.post_id,
            sampleComment.creation_time
        );
        expect(commentDao.deleteCommentByUser).not.toHaveBeenCalled();  // Ensure no deletion happened
        expect(accountDao.getUserRoleByUsername).toHaveBeenCalledWith(username);  // Ensure role check is performed
    });

    test("Should delete comment if user is an admin", async () => {
        // Arrange: Simulate comment written by someone else, and current user is admin
        commentDao.getCommentById.mockResolvedValueOnce({ ...sampleComment, written_by: 'differentUser' });
        commentDao.deleteCommentByUser.mockResolvedValueOnce(1);
        accountDao.getUserRoleByUsername.mockResolvedValueOnce('admin'); // Admin user

        // Act: Call the deleteComment function
        const result = await commentService.deleteComment(
            sampleComment.post_id,
            sampleComment.creation_time,
            username // 'username' is '1', different from 'differentUser'
        );

        // Assert: Ensure successful deletion
        expect(result).toBe(1);  // Successfully deleted
        expect(commentDao.getCommentById).toHaveBeenCalledWith(
            sampleComment.post_id,
            sampleComment.creation_time
        );
        expect(commentDao.deleteCommentByUser).toHaveBeenCalledWith(
            sampleComment.post_id,
            sampleComment.creation_time
        );
        expect(accountDao.getUserRoleByUsername).toHaveBeenCalledWith(username);  // Ensure admin check is performed
    });

    test("Should return 404 if comment not found", async () => {
        // Arrange: Simulate comment not found
        commentDao.getCommentById.mockResolvedValueOnce(null);

        // Act: Call the deleteComment function
        const result = await commentService.deleteComment(
            sampleComment.post_id,
            sampleComment.creation_time,
            username
        );

        // Assert: Ensure not found (404) response
        expect(result).toBe(0);  // Comment not found
        expect(commentDao.getCommentById).toHaveBeenCalledWith(
            sampleComment.post_id,
            sampleComment.creation_time
        );
        expect(commentDao.deleteCommentByUser).not.toHaveBeenCalled();  // Ensure no deletion happened
        expect(accountDao.getUserRoleByUsername).not.toHaveBeenCalled();  // No role check if comment not found
    });
});
