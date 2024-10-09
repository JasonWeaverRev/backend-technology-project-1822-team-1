const commentDao = require('../dao/commentDao');
const accountDao = require('../dao/accountDAO'); // Import the user DAO to fetch user details

/**
 * Updates a comment if it belongs to the user making the request
 */
async function updateComment(comment_id, comment_creation_time, body, username) {
  console.log(`Updating comment with ID: ${comment_id}, creation_time: ${comment_creation_time}, by user: ${username}`);

  // Fetch the comment to ensure it exists
  const comment = await commentDao.getCommentById(comment_id, comment_creation_time);

  if (!comment) {
    console.log("Comment not found");
    return 0; // Comment not found
  }

  // Check if the user requesting the update is the comment's author
  if (comment.written_by !== username) {
    console.log('Not authorized');
    return -1; // Unauthorized
  }

  // Proceed to update the comment
  const result = await commentDao.updateCommentByUser(comment_id, comment_creation_time, body);

  return result === 1 ? 1 : -2; // Return success or failure
}

/**
 * Deletes a comment if it belongs to the user making the request or if the user is an admin
 */
// commentService.js

const deleteComment = async (post_id, creation_time, username) => {
  console.log(`Deleting comment with ID: ${post_id}, creation_time: ${creation_time}, username: ${username}`);

  // Fetch the comment
  const comment = await commentDao.getCommentById(post_id, creation_time);
  if (!comment) {
    console.log('Comment not found');
    return 0; // Comment not found
  }

  // Authorization check
  if (comment.written_by !== username) {
    // Check if user is admin
    const userRole = await accountDao.getUserRoleByUsername(username);
    console.log(`User role: ${userRole}`);
    if (userRole !== 'admin') {
      console.log('Not authorized');
      return -1; // Not authorized
    }
  }

  // Proceed to delete
  const deleteResult = await commentDao.deleteCommentByUser(post_id, creation_time);
  return deleteResult;
};

module.exports = {
  deleteComment,
};



module.exports = {
  updateComment,
  deleteComment,
};
