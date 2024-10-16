// Setup post service and post dao to test post service
const PostService = require("../src/backend/service/postService");
const PostDao = require("../src/backend/dao/postDao.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../src/backend/dao/postDAO"); //Mock post db
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

/**
 * POST SERVICE TESTS
 */
describe("PostService Tests", () => {
  // Before each test:
  // Reset mock db
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * ==========================================
   * ADMIN DELETES
   * ==========================================
   */

  // Testing getPostById(postID) function
  describe("getPostById", () => {
    // Test 1.
    it("Test 1. Should return a post when given a valid, existing post id", async () => {
      const testPostId = "test_id";
      const mockPost = {
        post_id: "test_id",
        creation_time: "2024-09-26T20:13:48.133Z",
        body: "test_body",
        likes: 32,
        replies: [],
        title: "test_title",
        written_by: "test_user",
      };

      // when the POST DAO is called through the post service method, mock its return value within the DAO method
      PostDao.getPostById.mockReturnValue(mockPost);

      // Call upon the method being tested using the established mock values
      const result = await PostService.getPostById(testPostId);

      // Expects
      expect(PostDao.getPostById).toHaveBeenCalledWith(testPostId); // ensure that the DAO is being called with the correct post_id
      expect(result).toEqual(mockPost); // ensure that the existing post was found properly
    });

    // Test 2.
    it("Test 2. Should return null if the post id is invalid", async () => {
      const mockPostId = "test_id";

      PostDao.getPostById.mockReturnValue(null);

      const result = await PostService.getPostById(mockPostId);

      expect(result).toEqual(null);
    });
  });

  // Test deletePostById(postID)
  describe("deletePostById", () => {
    const mockPostId = "test_id";
    const mockPost = {
      post_id: "test_id",
      creation_time: "2024-09-26T20:13:48.133Z",
      body: "test_body",
      title: "test_title",
      parent_id: "test_parentid",
      written_by: "test_user",
    };

    //Test 3. No post id is given
    it("Test 3. Should throw an error for no post id given for deletion", async () => {
      try {
        const result = await PostService.deletePostById("");
      } catch (err) {
        expect(err.message).toBe(
          `Error: Please input a valid post ID [post_id = 'id']`
        );
      }
    });

    //Test 4. Post id is invalid/Post does not exist
    it("Test 4. Should throw an error if the given post id does not match an existing post", async () => {
      PostDao.getPostById.mockReturnValue(null);

      try {
        const result = await PostService.deletePostById(mockPostId);
      } catch (err) {
        expect(err.message).toBe(
          `Error: Post was not found with id of: ${mockPostId}`
        );
      }
    });

    //Test 5. Post id is valid: successfully deletes a post
    it("Test 5. Should return back '1' if a post was succesfully deleted", async () => {
      PostDao.getPostById.mockReturnValue(mockPost);
      PostDao.deletePostById.mockReturnValue(true);

      const result = await PostService.deletePostById(mockPostId);

      expect(PostDao.getPostById).toHaveBeenCalledWith(mockPostId);
      expect(PostDao.deletePostById).toHaveBeenCalledWith(
        mockPost.post_id,
        mockPost.creation_time
      );
      expect(result).toEqual(1);
    });

    //Test 6. Post id is valid: unexpected deletion error
    it("Test 6. Should return an error if the post could not be deleted from unknown circumstances", async () => {
      PostDao.getPostById.mockReturnValue(mockPost);
      PostDao.deletePostById.mockReturnValue(null);

      try {
        const result = await PostService.deletePostById(mockPostId);
      } catch (err) {
        expect(err.message).toBe(
          `Error: Encountered an unexpected error during deletion`
        );
      }
    });
  });
});


 /**
   * ==========================================
   * Like/Dislike Functionality 
   * ==========================================
   */


 // postService.test.js
const postService = require('../src/backend/service/postService');
const postDAO = require('../src/backend/dao/postDAO');

jest.mock('../src/backend/dao/postDAO');

describe('Post Service - Dislike Post', () => {
    const mockPost = {
        post_id: 'test-post-id',
        creation_time: '2024-09-26T20:13:48.133Z',
        liked_by: [],
        disliked_by: [],
    };
    const username = 'test-user';

    test('Should dislike post if user has not interacted before', async () => {
        // Arrange: Mock DAO responses
        postService.getPostById = jest.fn().mockResolvedValue(mockPost);
        postDAO.dislikePost = jest.fn().mockResolvedValue(1);

        // Act: Call the service
        const result = await postService.dislikePost(mockPost.post_id, username);

        // Assert: Ensure proper behavior
        expect(result).toEqual({ status: 200, message: 'Disliked successfully.' });
        expect(postDAO.dislikePost).toHaveBeenCalledWith(mockPost.post_id, mockPost.creation_time, username);
    });

    test('Should undislike post if user has already disliked it', async () => {
        // Arrange: Mock DAO responses
        postService.getPostById = jest.fn().mockResolvedValue(mockPost);
        postDAO.dislikePost = jest.fn().mockResolvedValue(3);

        // Act: Call the service
        const result = await postService.dislikePost(mockPost.post_id, username);

        // Assert: Ensure proper behavior
        expect(result).toEqual({ status: 200, message: 'Undisliked successfully.' });
        expect(postDAO.dislikePost).toHaveBeenCalledWith(mockPost.post_id, mockPost.creation_time, username);
    });

    test('Should switch from like to dislike if user liked the post', async () => {
        // Arrange: Mock DAO responses
        postService.getPostById = jest.fn().mockResolvedValue(mockPost);
        postDAO.dislikePost = jest.fn().mockResolvedValue(2);

        // Act: Call the service
        const result = await postService.dislikePost(mockPost.post_id, username);

        // Assert: Ensure proper behavior
        expect(result).toEqual({ status: 200, message: 'Disliked successfully.' });
        expect(postDAO.dislikePost).toHaveBeenCalledWith(mockPost.post_id, mockPost.creation_time, username);
    });

    test('Should return 404 if post is not found', async () => {
        // Arrange: Post not found
        postService.getPostById = jest.fn().mockResolvedValue(null);

        // Act: Call the service
        try {
            await postService.dislikePost('invalid-post-id', username);
        } catch (error) {
            // Assert: Ensure proper error is thrown
            expect(error.status).toBe(404);
            expect(error.message).toBe('Post with id invalid-post-id not found.');
        }
    });

    test('Should throw a 500 error if DAO fails', async () => {
        // Arrange: Mock DAO failure
        postService.getPostById = jest.fn().mockResolvedValue(mockPost);
        postDAO.dislikePost = jest.fn().mockResolvedValue(-1);

        // Act: Call the service
        try {
            await postService.dislikePost(mockPost.post_id, username);
        } catch (error) {
            // Assert: Ensure proper error is thrown
            expect(error.status).toBe(500);
            expect(error.message).toBe('Failed to dislike the post.');
        }
    });
});
