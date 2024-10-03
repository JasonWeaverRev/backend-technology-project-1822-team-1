/**
 * Performs business logic for the Ticket DB
 */
const uuid = require("uuid");
const postDAO = require("../dao/postDAO");
const {format } = require("winston");

/**
 * TEST ARROW METHOD
 * ============================================
 *  const getSomething = (target, index) => {
 *      stuff goes here
 *  }; 
 * ============================================
 */



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
 * Validates and creates a new post to the Delver Forum Posts table
 * 
 * @param {*} postContents contents of the post, including title (optional?) and body
 * @returns meta data of the post creation if successful, or null otherwise
 */
async function createPost(postContents) {
    
    if (validatePost(postContents)) {
        // Add the new post information
        let data = await postDAO.createPost({
            post_id: uuid.v4(),
            ...postContents,
            // written by
            creation_time: new Date().toISOString(),
            likes: 0,
            replies: []
        });
        return data;
    }

    // Invalid post
    return null;
}

/**
 * Validates and creates a new reply underneath a forum post to the Delver Forum Posts table
 * 
 * @param {*} replyCont 
 */
async function createReply(replyCont, parent_id) {

    console.log("Below is the parent id: ");
    console.log(parent_id);
    console.log("")

    // Validate reply contents
    if (validateReply(replyCont, parent_id)) {
        
        // If the parent post exists, add it to the forum post
        parentPost = await getPostById(parent_id);
        
        if(parentPost) {
            reply = {
                post_id: uuid.v4(),
                ...replyCont,
                parent_id,
                creation_time: new Date().toISOString(),
                likes: 0,
                replies: []
            };

            let data = await postDAO.createPost(reply);
            return data;
        }

        // Parent comment not found
        return -1;

    }

    // Parent post not found
    return 0;
}


/**
 * Validates the contents of a post. The post is valid if:
 * 
 *  - There exists a title, body, and written_by element
 *  - The body is not empty
 * 
 * @param {*} postContents
 * @returns true if the post is valid for creation, false otherwise 
 */
function validatePost(postContents) {
    return (
        postContents.title && 
        postContents.body &&
        postContents.written_by &&
        (postContents.body.length > 0)
    )
}

/**
 * Validates the contents of a reply comment. The post is valid if:
 * 
 *  - There exists a body, and written_by element, and the parent post id
 *  - The body is not empty
 *  - The parent post id is not empty
 * 
 * @param {*} replyCont
 * @returns true if the reply is valid for creation, false otherwise 
 */
function validateReply(replyCont, parent_id) {
    return (
        replyCont.body &&
        replyCont.written_by &&
        parent_id &&
        (replyCont.body.length > 0) &&
        (parent_id.length > 0)
    )
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
    getPostById,
    createPost,
    createReply
}