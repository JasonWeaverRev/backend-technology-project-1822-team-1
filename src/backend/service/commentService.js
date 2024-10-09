const commentDao = require('../dao/commentDao');
const accountDao = require('../dao/accountDao'); // Import the user DAO to fetch user details
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

<<<<<<< HEAD
=======

/**
 * Retrieves a list of comments, sorted by creation time from oldest to newest
 * 
 * Initially retrieves 8 posts, then 8 more with each consecutive load-more 
 */
const getCommentsByLoadSorted = async (parentID, loads) => {

  if (!parentID||!loads) {
    logger.info(
      `Failed getting comments sorted for a post: Invalid parent post id or page number`
    );
    throw {
      status: 400,
      message: `Error: Invalid parent post id or page number`,
    }; 
  }
  
  // Validate if the loads parameter cannot be translated to a number
  if (isNaN(loads)) {
    logger.info(
      `Failed getting comments sorted for a post: Non-numeric amount of loads`
    );
    throw {
      status: 400,
      message: `Error: Non-numeric amount of loads`,
    }; 
  }

  const commentsSorted = await getCommentsSortedByParent(parentID);
  const loadNum = parseInt(loads);

  // Validate the load number is 0 or positive
  if (loadNum <= 0) {
    logger.info(
      `Failed getting comments sorted for a post: Negative or zero amount of pages`
    );
    throw {
      status: 400,
      message: `Error: Negative or zero amount of pages inputted`,
    }; 
  }

  // No comments exist
  if (commentsSorted.length === 0) {
    logger.info(
      `Failed getting comments sorted for a post: No replies available`
    );
    throw {
      status: 404,
      message: `Error: No comments available for retrieval for this post`,
    }; 
  }

  // When the amount of pages exceeds the comments content capacity 
  else if (commentsSorted.length <= (8 + ((loadNum-2) * 8))) {
    logger.info(
      `Failed get posts sorted for landing page: Page number exceeds amount of comments that can be displayed`
    );
    throw {
      status: 400,
      message: `Error: Page number exceeds amount of comments that can be displayed`,
    }; 
  }

  // When the number of comments don't meet load capacity
  else if (commentsSorted.length <= (8 + ((loadNum-1) * 8))) {
    return commentsSorted;
  } 
  // more than 8 comments
  else {
    const commentsSortedByDenom = commentsSorted.slice(0, (8 + ((loadNum-1) * 8)));
    return commentsSortedByDenom;
  }

}


>>>>>>> 266103aa77bb317697fb302c326eb15c16aa34a3

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
