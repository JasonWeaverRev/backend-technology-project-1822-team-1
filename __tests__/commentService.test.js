const commentDAO = require('../src/backend/dao/commentDAO');
const commentService = require('../src/backend/service/commentService');

// Mock DAO functions
jest.mock('../src/backend/dao/commentDAO');

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

// Mock functions
commentDAO.getCommentById = jest.fn();
commentDAO.updateCommentByUser = jest.fn();
commentDAO.deleteCommentByUser = jest.fn();


// ====== Tests for Updating Comment ======

describe('Comment Service - Update Comment', () => {
    test('Should update comment if user is the author', async () => {
        // Arrange
        commentDAO.getCommentById.mockResolvedValueOnce(sampleComment);
        commentDAO.updateCommentByUser.mockResolvedValueOnce(1);

        // Act
        const result = await commentService.updateComment(sampleComment.comment_id, sampleComment.creation_time, 'Updated comment body', sampleComment.written_by);

        // Assert
        expect(result).toBe(1);
        expect(commentDAO.getCommentById).toHaveBeenCalledWith(sampleComment.comment_id, sampleComment.creation_time);
        expect(commentDAO.updateCommentByUser).toHaveBeenCalledWith(sampleComment.comment_id, sampleComment.creation_time, 'Updated comment body');
    });

    test('Should return 403 if user is not the author', async () => {
        // Arrange: Mock the comment, but different author
        commentDAO.getCommentById.mockResolvedValueOnce({ ...sampleComment, written_by: 'differentUser' });

        // Act
        const result = await commentService.updateComment(sampleComment.comment_id, sampleComment.creation_time, 'Updated comment body', sampleComment.written_by);

        // Assert
        expect(result).toBe(-1); // Unauthorized
        expect(commentDAO.getCommentById).toHaveBeenCalledWith(sampleComment.comment_id, sampleComment.creation_time);
        expect(commentDAO.updateCommentByUser).not.toHaveBeenCalled();
    });

    test('Should return 404 if comment not found', async () => {
        // Arrange: Comment not found
        commentDAO.getCommentById.mockResolvedValueOnce(null);

        // Act
        const result = await commentService.updateComment(sampleComment.comment_id, sampleComment.creation_time, 'Updated comment body', sampleComment.written_by);

        // Assert
        expect(result).toBe(0); // Comment not found
        expect(commentDAO.getCommentById).toHaveBeenCalledWith(sampleComment.comment_id, sampleComment.creation_time);
        expect(commentDAO.updateCommentByUser).not.toHaveBeenCalled();
    });
});


// ====== Tests for Deleting Comment ======

describe("Comment Service - Delete Comment", () => {
    let sampleComment;
    let samplePost;
    let username;

    beforeEach(() => {
        username = '1';
        samplePost = {
            post_id: 'parent_post_id',
            creation_time: 'parent_post_creation_time',
            replies: ['comment_id']
        };
        sampleComment = {
            comment_id: 'comment_id',
            creation_time: 'comment_creation_time',
            written_by: username
        };
        commentDAO.getCommentById.mockClear();
        commentDAO.deleteCommentByUser.mockClear();
    });

    test("Should delete comment if user is the author", async () => {
        // Arrange
        commentDAO.getCommentById.mockResolvedValueOnce(sampleComment);
        commentDAO.deleteCommentByUser.mockResolvedValueOnce(1);

        // Act
        const result = await commentService.deleteComment(
            samplePost.post_id,            // post_id
            samplePost.creation_time,      // post_creation_time
            sampleComment.comment_id,      // comment_id
            sampleComment.creation_time,   // comment_creation_time
            username                       // username
        );

        // Assert
        expect(result).toBe(1);  // Successfully deleted
        expect(commentDAO.getCommentById).toHaveBeenCalledWith(sampleComment.comment_id, sampleComment.creation_time);
        expect(commentDAO.deleteCommentByUser).toHaveBeenCalledWith(
            samplePost.post_id,
            samplePost.creation_time,
            sampleComment.comment_id,
            sampleComment.creation_time
        );
    });

    // ... Update the other test cases similarly
});
