/**
 * Performs business logic for the Ticket DB
 */
const uuid = require("uuid");

// Local module imports
const postDAO = require("../dao/postDao");
const { logger } = require("../utils/logger");

/**
 * Deletes a post by its ID
 *
 * @param {*} postID id of the post to be deleted
 * @returns 1 if the post was found and deleted, or throws an error otherwise
 */
async function deletePostById(postID) {
  // Validate that the post id is present in the request body
  if (!postID) {
    logger.info(`Failed Admin post deletion attempt: Invalid post ID`);
    throw {
      status: 401,
      message: `Error: Please input a valid post ID [post_id = 'id']`,
    };
  }

  // Validate if the post exists
  foundPost = await getPostById(postID);
  if (foundPost) {
    // Search for posts that have the to-be-deleted post as their parent, then remove their parent_ids
    const childData = await removeParents(postID);

    // Delete the post
    let data = await postDAO.deletePostById(
      foundPost.post_id,
      foundPost.creation_time
    );

    // If errors arise during deletion
    if (!data) {
      logger.info(
        `Failed Admin post deletion attempt: Unexpected error occured during deletion`
      );
      throw {
        status: 400,
        message: `Error: Encountered an unexpected error during deletion`,
      };
    }

    return 1;
  }

  // Post was not found
  logger.info(
    `Failed Admin post deletion attempt: Post not found from given post ID`
  );
  throw {
    status: 404,
    message: `Error: Post was not found with id of: ${postID}`,
  };
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
      liked_by: [user.username],
      disliked_by: [],
    };
    let data = await postDAO.createPost(newPost);

    return data;
  }

  // Invalid post
  logger.info(`Failed forum post creation attempt: Invalid title or body`);
  throw {
    status: 400,
    message: `Error: Please enter a valid title and body`,
  };
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
    const parentPost = await getPostById(parent_id);
    if (parentPost) {
      // Create new reply
      reply = {
        post_id: uuid.v4(),
        ...replyCont,
        written_by: user.username,
        creation_time: new Date().toISOString(),
        parent_id,
        liked_by: [user.username],
        disliked_by: [],
      };

      let data = await postDAO.createPost(reply);

      return data;
    }
    // Parent comment not found
    logger.info(
      `Failed forum reply comment creation failed: Parent post not found`
    );
    throw {
      status: 400,
      message: `Error: Could not find post you are replying to`,
    };
  }

  // Parent post not found
  logger.info(`Failed forum reply comment creation: Invalid reply contents`);
  throw {
    status: 400,
    message: `Error: Invalid reply post contents. Make sure to have a 'body' and 'written by' in the request body`,
  };
}

/**
 * Retrieves a list of posts, sorted by creation time from newest to oldest
 *
 * Initially retrieves 4 posts, with each consecutive load-more
 */
const getPostsSorted = async (loads) => {
  // Validate if the loads parameter cannot be translated to a number
  if (isNaN(loads)) {
    logger.info(
      `Failed get posts sorted for landing page: Non-numeric amount of pages`
    );
    throw {
      status: 400,
      message: `Error: Non-numeric amount of pages`,
    };
  }

  const postsSorted = await getAllPostsSorted();
  const loadNum = parseInt(loads);

  // Validate the load number is a positive integer
  if (loadNum <= 0) {
    logger.info(
      `Failed get posts sorted for landing page: Negative or zero amount of pages`
    );
    throw {
      status: 400,
      message: `Error: Negative or zero amount of pages inputted`,
    };
  }

  // No posts exist
  if (postsSorted.length === 0) {
    logger.info(`Failed get posts sorted for landing page: Empty forum table`);
    throw {
      status: 404,
      message: `Error: No posts available for retrieval`,
    };
  }

  // When the amount of pages exceeds the posts content capacity
  else if (postsSorted.length <= 4 + (loadNum - 2) * 4) {
    logger.info(
      `Failed get posts sorted for landing page: Page number exceeds amount of posts that can be displayed`
    );
    throw {
      status: 404,
      message: `Error: Page number exceeds amount of posts that can be displayed`,
    };
  }

  // When the number of posts don't meet load capacity
  else if (postsSorted.length <= 4 + (loadNum - 1) * 4) {
    return [postsSorted, postsSorted.length];
  }
  // more than 4 posts
  else {
    const postsSortedByDenom = postsSorted.slice(0, 4 + (loadNum - 1) * 4);
    return [postsSortedByDenom, postsSorted.length];
  }
};

/**
 * Retrieves the newest added post to the forums for page/post sorting
 *
 * @returns the newest added post
 */
const getNewestPost = async () => {
  return await postDAO.getNewestPost();
};

/**
 * =======================
 * HELPER FUNCTIONS BELOW
 * =======================
 */

/**
 * Retrieve a post by its post ID
 *
 * @param {*} postID ID of the post to retrieve
 * @returns the post, or null if the post does not exist
 */
async function getPostById(postID) {
  return await postDAO.getPostById(postID);
}

/**
 * Retrieve all posts
 *
 * @returns An array containing every post
 */
const getAllPosts = async () => {
  return await postDAO.getAllPosts();
};

/**
 * Retrieves a list of all posts, sorted by creation time, excluding comments
 *
 * @returns list of all posts, sorted by creation time
 */
const getAllPostsSorted = async () => {
  const posts = await postDAO.getAllPosts();
  const postTimeList = [];
  const sortedPosts = [];

  // Create a list of all posts, attached to a time
  posts.forEach((post) => {
    if (!post.parent_id) {
      postTimeList.push([post, post.creation_time]);
    }
  });

  // Sort the list by the attached time in descending order (newest first)
  postTimeList.sort(function (a, b) {
    return new Date(b[1]) - new Date(a[1]); // compares index 1, or the creation time
  });

  // Create a list of all posts, using a sorted list WITHOUT the extra time attachment
  postTimeList.forEach((sortedPost) => {
    sortedPosts.push(sortedPost[0]);
  });

  return sortedPosts;
};

/**
 * Removes the parent post's id from all of its children posts
 *
 * @param parentPostID parent_id to be removed from all posts
 */
async function removeParents(parentPostID) {
  //Get list of children
  const repList = await postDAO.getPostsByParentId(parentPostID);

  //Remove parents from children one-by-one
  if (repList) {
    repList.forEach(async (replyPost, i) => {
      await postDAO.removeParent(replyPost);
    });
  }

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
    postContents.body.length > 0
  );
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
    replyCont.body.length > 0 &&
    parent_id.length > 0
  );
}

// POST INTERACTION

/**
 * Likes a post on behalf of a user
 */
/**
 * Likes or unlikes a post based on the current state
 */
async function likePost(post_id, username) {
  const post = await getPostById(post_id);

  if (!post) {
    throw {
      status: 404,
      message: `Post with id ${post_id} not found.`,
    };
  }

  const result = await postDAO.likePost(post_id, post.creation_time, username);

  // 3: Unliked successfully
  if (result === 3) {
    return 3; // Unliked
  }
  // 2: Liked successfully
  else if (result === 2) {
    return 2; // Liked
  }
  // Anything else should be considered an error
  else if (result !== 1) {
    throw {
      status: 500,
      message: "Failed to like the post.",
    };
  }

  return 1; // Success (default case for first-time liking)
}

/**
 * Dislikes a post on behalf of a user
 */
/**
 * Un-Dislikes a post on behalf of a user
 */
async function dislikePost(post_id, username) {
  const post = await getPostById(post_id);
  if (!post) {
    throw {
      status: 404,
      message: `Post with id ${post_id} not found.`,
    };
  }

  // Delegate to DAO
  const result = await postDAO.dislikePost(
    post_id,
    post.creation_time,
    username
  );

  console.log("Dislike DAO result:", result);

  if (result === 3) {
    return { status: 200, message: "Undisliked successfully." };
  } else if (result === 2) {
    return { status: 200, message: "Disliked successfully." };
  } else if (result !== 1) {
    throw {
      status: 500,
      message: "Failed to dislike the post.",
    };
  }

  return { status: 200, message: "Disliked successfully." };
}

module.exports = {
  deletePostById,
  getPostById,
  getAllPosts,
  createPost,
  createReply,
  getAllPostsSorted,
  getPostsSorted,
  getNewestPost,
  likePost,
  dislikePost,
};
