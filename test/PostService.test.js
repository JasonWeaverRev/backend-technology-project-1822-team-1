// Setup post service and post dao to test post service
const PostService = require("../src/backend/service/postService");
const PostDao = require("../src/backend/dao/postDAO");
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
    })

    /**
     * ==========================================
     * ADMIN DELETES
     * ==========================================
     */

    // Testing getPostById(postID) function
    describe("getPostById", () => {
        
        // Test 1.
        it("Should return a post when given a valid, existing post id", async () => {
          const testPostId = "test_id";
          const mockPost = {
            post_id: "test_id",
            creation_time: "2024-09-26T20:13:48.133Z",
            body: "test_body",
            likes: 32,
            replies: [],
            title: "test_title",
            written_by: "test_user"
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
        it("Should return null if the post id is invalid", async () => {
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
            likes: 32,
            replies: [],
            parent_id: "test_parentid",
            written_by: "test_user"
        };
        
        //Test 1. No post id is given
        it("Should throw an error for no post id given for deletion", async () => {

            try {
                const result = await PostService.deletePostById("");
            } catch (err) {
                expect(err.message).toBe(`Error: Please input a valid post ID [post_id = 'id']`);
            }
        });

        //Test 2. Post id is invalid/Post does not exist
        it("Should throw an error if the given post id does not match an existing post", async () => {

            PostDao.getPostById.mockReturnValue(null);

            try {
                const result = await PostService.deletePostById(mockPostId);
            } catch (err) {
                expect(err.message).toBe(`Error: Post was not found with id of: ${mockPostId}`);
            }
        });

        //Test 3. Post id is valid: successfully deletes a post
        it("Should return back '1' if a post was succesfully deleted", async () => {
            
            PostDao.getPostById.mockReturnValue(mockPost);
            PostDao.deletePostById.mockReturnValue(true);

            const result = await PostService.deletePostById(mockPostId);

            expect(PostDao.getPostById).toHaveBeenCalledWith(mockPostId);
            expect(PostDao.deletePostById).toHaveBeenCalledWith(mockPost.post_id, mockPost.creation_time);  
            expect(result).toEqual(1); 
        });

        //Test 4. Post id is valid: parent post successfully removes a reply
        it("Should remove a reply from a parent post if the reply post is deleted", async () => {
            const mockParentPost = {
                post_id: "test_parentid",
                creation_time: "2023-09-26T20:13:48.999Z",
                body: "test_parentbody",
                likes: 4000,
                replies: [mockPostId],
                title: "test_parenttitle",
                written_by: "test_parentuser"
            };

            PostDao.getPostById
                .mockReturnValueOnce(mockPost)
                .mockReturnValueOnce(mockParentPost);
            PostDao.removeReplyFromParent.mockReturnValue(true)
            PostDao.deletePostById.mockReturnValue(true);

            const result = await PostService.deletePostById(mockPostId);

            expect(PostDao.getPostById).toHaveBeenCalledWith(mockParentPost.post_id);
            expect(PostDao.removeReplyFromParent).toHaveBeenCalledWith(mockPostId, mockParentPost.post_id, mockParentPost.creation_time);
            expect(result).toEqual(1); 
        });

        //Test 5. Post id is valid: unexpected deletion error
        it("Should return an error if the post could not be deleted from unknown circumstances", async () => {

            PostDao.getPostById.mockReturnValue(mockPost);
            PostDao.deletePostById.mockReturnValue(null);

            try {
                const result = await PostService.deletePostById(mockPostId);
            } catch (err) {
                expect(err.message).toBe(`Error: Encountered an unexpected error during deletion`);
            }

        });

    });

});