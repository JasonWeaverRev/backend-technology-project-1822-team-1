const commentDao = require('../dao/commentDao');
const accountDao = require('../dao/accountDAO'); // Import the user DAO to fetch user details
const { logger } = require("../utils/logger");

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


/**
 * =================
 * HELPER FUNCTIONS
 * =================
 */
/**
 * Retrieves a list of comments, sorted by creation time, excluding comments, in ascending order,
 * all with the same parent post
 * 
 * @returns list of comments, sorted by creation time
 */
const getCommentsSortedByParent = async (parentID) => {
  const comments = await commentDao.getCommentsByParent(parentID);
  const commentsTimeList = [];
  const sortedComments = [];

  // Create a list of all comments, attached to a time
  comments.forEach((comment) => {
    if (comment.parent_id) {
      commentsTimeList.push([comment, comment.creation_time]);
    }
  });

  // Sort the list by the attached time in ascending order (oldest first)
  commentsTimeList.sort(function(a, b) {
      return new Date(a[1]) - new Date(b[1]); // compares index 1, or the creation time
  });

  // Create a list of all comments, using a sorted list WITHOUT the extra time attachment
  commentsTimeList.forEach((sortedComment) => {
    sortedComments.push(sortedComment[0]);  
  });

  return sortedComments;
}

module.exports = {
  updateComment,
  deleteComment,
  getCommentsByLoadSorted
};
