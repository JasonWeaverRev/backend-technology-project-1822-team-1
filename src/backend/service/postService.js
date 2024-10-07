/**
 * Performs business logic for the Ticket DB
 */
const uuid = require("uuid");

// Local module imports
const postDAO = require("../dao/postDao.js");
const accountDAO = require("../dao/AccountDAO");
const { logger } = require("../utils/logger");

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
 * @returns 1 if the post was found and deleted, or throws an error otherwise
 */
async function deletePostById(postID) {
    // Validate that the post id is present in the request body
    if(!postID) {
        logger.info(`Failed Admin post deletion attempt: Invalid post ID`);
        throw { status: 401, message: `Error: Please input a valid post ID [post_id = 'id']`};
    }

    // Validate if the post exists
    foundPost = await getPostById(postID);
    if(foundPost) {
        // If the post-to-be-deleted has a parent, remove the reply from the parent's reply list
        if(foundPost.parent_id) {
            parentPost = await getPostById(foundPost.parent_id);
            const parentData = await postDAO.removeReplyFromParent(postID, parentPost.post_id, parentPost.creation_time);
        }

        // If the post-to-be-deleted has a reply list, remove the parent from each reply
        if(foundPost.replies.length > 0) {
            childData = await removeParents(foundPost);
        }

        // Delete the post
        let userData = await accountDAO.deletePostFromUserForums(postID, foundPost.written_by);
        let data = await postDAO.deletePostById(foundPost.post_id, foundPost.creation_time);
        
        

        // If errors arise during deletion
        if(!data) {
            logger.info(`Failed Admin post deletion attempt: Unexpected error occured during deletion`);
            throw { status: 400, message: `Error: Encountered an unexpected error during deletion`};
        }

        return 1;
    }

    // Post was not found
    logger.info(`Failed Admin post deletion attempt: Post not found from given post ID`);
    throw { status: 404, message: `Error: Post was not found with id of: ${postID}`};
}

/**
 * Validates and creates a new post to the Delver Forum Posts table
 * 
 * @param {*} postContents contents of the post, including title (optional?) and body
 * @returns meta data of the post creation if successful, or null otherwise
 */
async function createPost(postContents, user) {

    if (validatePost(postContents, user)) {
        // Add the new post information
        
        newPost = {
            post_id: uuid.v4(),
            ...postContents,
            written_by: user.username,
            creation_time: new Date().toISOString(),
            likes: 0,
            liked_by: [],
            disliked_by: [],
            replies: []
        }
        let data = await postDAO.createPost(newPost);
        let userData = await accountDAO.addPostToUserForumPosts(newPost.post_id, newPost.written_by);

        return data;
    }

    // Invalid post
    logger.info(`Failed forum post creation attempt: Invalid title, body, or written_by fields`);
    throw { status: 400, message: `Error: Please enter a valid title, body, and user information`};

}

/**
 * Validates and creates a new reply underneath a forum post to the Delver Forum Posts table
 * 
 * @param {*} replyCont 
 */
async function createReply(replyCont, parent_id, user) {

    // Validate reply contents
    if (validateReply(replyCont, parent_id, user)) {
        
        // If the parent post exists, add it to the forum post

        parentPost = await getPostById(parent_id);

        console.log(parentPost);
        
        if(parentPost) {
            // Create new reply
            reply = {
                post_id: uuid.v4(),
                ...replyCont,
                written_by: user.username,
                creation_time: new Date().toISOString(),
                parent_id,
                likes: 0,
                liked_by: [],
                disliked_by: [],
                replies: []
            };

            let data = await postDAO.createPost(reply);
            let userData = await accountDAO.addPostToUserForumPosts(reply.post_id, reply.written_by);

            // Add the reply to the parent reply list 

            let parentData = await postDAO.addReplyToParentList(reply.post_id, parent_id, parentPost.creation_time);

            if (!parentData) {
                logger.info(`Failed forum reply comment creation failed: Error found in adding the reply to the parent reply list`);
                throw { status: 400, message: `Error: Could not add your reply to the original poster's reply list`};
            }

            return data;
        }
        // Parent comment not found
        logger.info(`Failed forum reply comment creation failed: Parent post not found`);
        throw { status: 400, message: `Error: Could not find post you are replying to`};
    }

    // Parent post not found
    logger.info(`Failed forum reply comment creation failed: Invalid reply contents`);
    throw { status: 400, message: `Error: Invalid reply post contents. Make sure to have a 'body' and 'written by' in the request body`};
}


/**
 * Removes the parent post's id from all of its children posts 
 * 
 * @param parentPost parent post to be removed from all children, containing parent post ID and reply list
 */
async function removeParents(parentPost) {
    //Get list of children
    repList = parentPost.replies;
    
    //Remove parents from children one-by-one
    repList.forEach( async (replyID, i) => {
        await postDAO.removeParent(replyID);
    });

    return 1;
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
function validatePost(postContents, user) {

    return (
        postContents.title && 
        postContents.body &&
        user.username &&
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
function validateReply(replyCont, parent_id, user) {
    return (
        replyCont.body &&
        parent_id &&
        user.username &&
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
    deletePostById,
    getPostById,
    createPost,
    createReply
}