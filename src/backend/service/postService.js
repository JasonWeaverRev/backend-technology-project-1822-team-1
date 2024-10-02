/**
 * Performs business logic for the Ticket DB
 */
const uuid = require("uuid");
const postDAO = require("../dao/postDAO");

/**
 * Deletes a post by its ID
 * 
 * @param {*} postID id of the post to be deleted
 * @returns -1 if the request body was not valid, 0 if the post does not exist, 1 if the post was found and deleted, -2 if errors arose in the DAO during deletion
 */
async function deletePostByIdAdmin(postID) {
    
    // Validate that the post id is present in the request body
    if(!postID || !postID.post_id) {
        return -1;
    }

    // Validate if the post exists
    foundPost = await getPostById(postID.post_id);

    if(foundPost) {
        let data = await postDAO.deletePostByIdAdmin(foundPost.post_id, foundPost.creation_time);

        // If errors arise during deletion
        if(!data) {
            return -2;
        }
        return 1;
    }

    // Post was not found
    return 0;
}

/**
 * Retrieve a post by its post ID
 * 
 * @param {*} postID ID of the post to retrieve
 * @returns the post, or null if the post does not exist
 */
async function getPostById(postID) {
    return await postDAO.getPostById(postID);
}

module.exports = {
    deletePostByIdAdmin,
    getPostById
}