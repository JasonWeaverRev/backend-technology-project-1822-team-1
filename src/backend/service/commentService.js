const commentDAO = require('../dao/commentDAO');

/**
 * Updates a comment if it belongs to the user making the request
 */
async function updateComment(post_id, post_creation_time, comment_creation_time, body, username) {
    // Fetch the post to ensure it exists
    const post = await commentDAO.getPostById(post_id, post_creation_time);

    if (!post) {
        return 0;  // Post not found
    }

    // Find the comment in the post's replies
    const commentIndex = post.replies.findIndex(reply => reply.creation_time === comment_creation_time);

    if (commentIndex === -1) {
        return 0;  // Comment not found
    }

    const comment = post.replies[commentIndex];

    // Check if the user requesting the update is the comment's author
    if (comment.written_by !== username) {
        return -1;  // Unauthorized
    }

    // Proceed to update the comment
    const result = await commentDAO.updateCommentByUser(post_id, post_creation_time, comment_creation_time, body);
    return result === 1 ? 1 : -2;  // Return success or failure
}

/**
 * Deletes a comment if it belongs to the user making the request
 */
async function deleteComment(post_id, post_creation_time, comment_creation_time, username) {
    console.log(`Deleting comment for post_id: ${post_id}, post_creation_time: ${post_creation_time}, comment_creation_time: ${comment_creation_time}, username: ${username}`);
    
    // Fetch the post to ensure it exists
    const post = await commentDAO.getPostById(post_id, post_creation_time);

    if (!post) {
        console.log("Post not found");
        return 0;  // Post not found
    }

    // Find the comment in the post's replies
    const commentIndex = post.replies.findIndex(reply => reply.creation_time === comment_creation_time);

    if (commentIndex === -1) {
        console.log("Comment not found");
        return 0;  // Comment not found
    }

    const comment = post.replies[commentIndex];

    // Check if the user requesting the deletion is the comment's author
    if (comment.written_by !== username) {
        console.log('Not authorized');
        return -1;  // Unauthorized
    }

    // Proceed to delete the comment
    const result = await commentDAO.deleteCommentByUser(post_id, post_creation_time, comment_creation_time);
    return result === 1 ? 1 : -2;  // Return success or failure
}

module.exports = {
    updateComment,
    deleteComment
};
