const commentDAO = require('../dao/commentDAO');

/**
 * Updates a comment if it belongs to the user making the request
 * 
 * @param {String} postID - ID of the post containing the comment
 * @param {String} creationTime - Creation time of the comment (used as a key)
 * @param {String} newCommentText - The new text of the comment
 * @param {String} username - Username of the user making the request
 * @returns {Number} - 1 if successful, -1 if unauthorized, 0 if not found
 */
async function updateComment(postID, creationTime, newCommentText, username) {
    // Fetch the comment to ensure it exists
    const comment = await commentDAO.getCommentById(postID, creationTime);

    if (!comment) {
        return 0;  // Comment not found
    }

    // Check if the user requesting the update is the comment's author
    if (comment.written_by !== username) {
        return -1;  // Unauthorized: User is not the owner of the comment
    }

    // If the user owns the comment, proceed to update it
    const result = await commentDAO.updateCommentByUser(postID, creationTime, newCommentText);
    return result ? 1 : -2;  // Return success or failure
}

/**
 * Deletes a comment if it belongs to the user making the request
 * 
 * @param {String} postID - ID of the post containing the comment
 * @param {String} creationTime - Creation time of the comment (used as a key)
 * @param {String} username - Username of the user making the request
 * @returns {Number} - 1 if successful, -1 if unauthorized, 0 if not found
 */
async function deleteComment(postID, creationTime, username) {
    // Fetch the comment to ensure it exists
    const comment = await commentDAO.getCommentById(postID, creationTime);

    if (!comment) {
        return 0;  // Comment not found
    }

    // Check if the user requesting the deletion is the comment's author
    if (comment.written_by !== username) {
        return -1;  // Unauthorized: User is not the owner of the comment
    }

    // If the user owns the comment, proceed to delete it
    const result = await commentDAO.deleteCommentByUser(postID, creationTime);
    return result ? 1 : -2;  // Return success or failure
}

module.exports = {
    updateComment,
    deleteComment
};