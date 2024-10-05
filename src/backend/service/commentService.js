const commentDAO = require('../dao/commentDAO');

/**
 * Updates a comment if it belongs to the user making the request
 */
async function updateComment(comment_id, comment_creation_time, body, username) {
    console.log(`Updating comment with ID: ${comment_id}, creation_time: ${comment_creation_time}, by user: ${username}`);

    // Fetch the comment to ensure it exists
    const comment = await commentDAO.getCommentById(comment_id, comment_creation_time);

    if (!comment) {
        console.log("Comment not found");
        return 0;  // Comment not found
    }

    // Check if the user requesting the update is the comment's author
    if (comment.written_by !== username) {
        console.log('Not authorized');
        return -1;  // Unauthorized
    }

    // Proceed to update the comment
    const result = await commentDAO.updateCommentByUser(comment_id, comment_creation_time, body);

    return result === 1 ? 1 : -2;  // Return success or failure
}


/**
 * Deletes a comment if it belongs to the user making the request
 */
async function deleteComment(post_id, post_creation_time, comment_id, comment_creation_time, username) {
    console.log(`Deleting comment for post_id: ${post_id}, post_creation_time: ${post_creation_time}, comment_id: ${comment_id}, comment_creation_time: ${comment_creation_time}, username: ${username}`);
    
    // Fetch the comment to ensure it exists
    const comment = await commentDAO.getCommentById(comment_id, comment_creation_time);

    if (!comment) {
        console.log("Comment not found");
        return 0;  // Comment not found
    }

    // Check if the user requesting the deletion is the comment's author
    if (comment.written_by !== username) {
        console.log('Not authorized');
        return -1;  // Unauthorized
    }

    // Proceed to delete the comment
    const result = await commentDAO.deleteCommentByUser(post_id, post_creation_time, comment_id, comment_creation_time);
    return result === 1 ? 1 : -2;  // Return success or failure
}

module.exports = {
    updateComment,
    deleteComment
};
