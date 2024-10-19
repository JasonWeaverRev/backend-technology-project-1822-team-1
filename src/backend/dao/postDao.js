/**
 * Representation of the Post Repository and Post Repository services
 */
const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    ScanCommand,
    QueryCommand
} = require("@aws-sdk/lib-dynamodb");
const {logger} = require("../utils/logger");

// Table and DynamoDB Document information
const client = new DynamoDBClient({region: "us-east-1"});
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = 'Delver_Forum_Posts';


/**
 * Creates a new post to the forums table
 * 
 * @param Item post to be created
 */
async function createPost(Item) {
    
    // Create new put command with the post meta data
    const command = new PutCommand( {
        TableName,
        Item
    });

    // Send command to the DB
    try {
        const data = await documentClient.send(command);
        return data;
    } catch(err) {
        logger.error(err); 
    }
}


/**
 * Deletes a specific post using admin privileges  
 * 
 * @param postID id of the post to be deleted by an admin
 * @returns meta data of the request
 */
async function deletePostById(postID, crTime) {

    // delete a post
    const command = new DeleteCommand( {
        TableName,
        Key: {
            post_id: postID,
            creation_time: crTime
        }
    });

    // Send command to the DB
    try {
        const data = await documentClient.send(command);
        return data;
    } catch(err) {
        logger.error(err);
    }
}


/**
 * Removes a parent id from a post
 * 
 * @param replyID Id of post to have its parent removed
 */
const removeParent = async(replyPost) => {
    const command = new UpdateCommand ( {
        TableName,
        Key: {
            post_id: replyPost.post_id,
            creation_time: replyPost.creation_time
        },
        UpdateExpression: "set parent_id = :status",
        ExpressionAttributeValues: {
            ":status": "deleted"
        }
    });

    // Send command to the DB
    try {
        const data = await documentClient.send(command);
        return data;
    } catch(err) {
        logger.error(err);
    }
};


/**
 * Retrieves a list of all posts in the forums table
 */
const getAllPosts = async() => {
    const command = new ScanCommand( {
        TableName
    })

    try {
        const data = await documentClient.send(command);
        return data.Items;
    } catch(err) {
        console.error(err);
        throw { status: 500, message: "Error: Could not retrieve posts at this time" };
    }
}

/**
 * Retrieves a post using a post id
 * 
 * @param postID ID of the post to be retrieved
 * @returns the post with the same post ID, or null
 */
async function getPostById(postID) {

    // Create a query finding the post with its ID as the key condition
    const command = new QueryCommand( {
        TableName,
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: {
            "#id": "post_id"
        },
        ExpressionAttributeValues: {
            ":id": postID
        }
    });

    // Send command to the DB
    try {
        const data = await documentClient.send(command);
        return data.Items[0];
    } catch(err) {
        logger.error(err);
    }
}

/**
 * Retrieves all posts sharing the same given parent id
 * 
 * @param {*} parentID parent id to search for 
 */
const getPostsByParentId = async (parentID) => {

    // Create a query finding the post with its ID as the key condition
    const command = new QueryCommand( {
        TableName,
        IndexName: "parent_id-post_id-index",
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: {
            "#id": "parent_id"
        },
        ExpressionAttributeValues: {
            ":id": parentID
        }
    });

    // Send command to the DB
    try {
        const data = await documentClient.send(command);
        return data.Items;
    } catch(err) {
        console.error(err);
        logger.error(err);
    }
}

const getPostsByWrittenBy = async (username) => {
  const written_by = username;
  const command = new QueryCommand({
    TableName,
    IndexName: "user_by_creation_time-index",
    KeyConditionExpression: "#written_by = :written_by", // GSI's partition key
    ExpressionAttributeNames: {
      "#written_by": "written_by",
    },
    ExpressionAttributeValues: {
      ":written_by": username,
    },
  });

  try {
    const data = await documentClient.send(command);
    console.log(data.Items);
    return data.Items; // Return items from the query
  } catch (err) {
    console.error("Error in getPostsByWrittenBy:", err);
    throw err;
  }
};


/**
 * Retrieves the newest created post
 */
const getNewestPost = async () => {
    // Create a query finding the post with its ID as the key condition
    const command = new ScanCommand( {
        TableName
    });

    // Send command to the DB
    try {
        const data = await documentClient.send(command);
        
        // Sort times to retrieve the newest post
        if (data.Items.length > 0) {
            // Recursively check between whether a post is earlier than another post
            let newestPost = null;

            for (let i = 0; i < data.Items.length; i++) {
                const tempPost = data.Items[i];
                const tempDate = new Date(tempPost.creation_time);

                if (!newestPost || tempDate > new Date(newestPost.creation_time)) {
                    newestPost = tempPost;
                }
            }

            return newestPost; 
        }
        // No posts exist in the table
        else {
            console.error(err);
            throw { status: 404, message: "Error: No posts were found in the forums" };
        }

    } catch(err) {
        logger.error(err);
    }
}

/// POST INTERACTION

/**
 * Likes a post by adding the username to the 'liked_by' set and updating 'likes' counter
 */
async function likePost(post_id, creation_time, username) {
    try {
      // Fetch the post to get current liked_by and disliked_by lists
      const postData = await documentClient.send(new GetCommand({
        TableName,
        Key: {
          post_id: post_id,
          creation_time: creation_time,
        },
        ProjectionExpression: 'liked_by, disliked_by',
      }));
  
      if (!postData.Item) {
        return 0; // Post not found
      }
  
      const post = postData.Item;
      const likedBy = post.liked_by || [];
      const dislikedBy = post.disliked_by || [];
  
      console.log('Liked By:', likedBy);
      console.log('Disliked By:', dislikedBy);
  
      // Check if user already liked the post
      if (likedBy.includes(username)) {
        const index = likedBy.indexOf(username);
  
        console.log(`Unliking post for user ${username}`);
  
        // Unlike the post by removing the user from liked_by
        await documentClient.send(new UpdateCommand({
          TableName,
          Key: {
            post_id: post_id,
            creation_time: creation_time,
          },
          UpdateExpression: 'SET likes = likes - :inc REMOVE liked_by[' + index + ']',
          ExpressionAttributeValues: {
            ':inc': 1,
          },
        }));
  
        return 3; // Unliked successfully
      }
  
      // Check if user previously disliked the post
      if (dislikedBy.includes(username)) {
        const index = dislikedBy.indexOf(username);
  
        console.log(`Switching from dislike to like for user ${username}`);
  
        // Switch from dislike to like
        await documentClient.send(new UpdateCommand({
          TableName,
          Key: {
            post_id: post_id,
            creation_time: creation_time,
          },
          UpdateExpression: 'SET likes = likes + :inc, liked_by = list_append(if_not_exists(liked_by, :emptyList), :user) REMOVE disliked_by[' + index + ']',
          ExpressionAttributeValues: {
            ':inc': 2, // Undo dislike (-1) and add like (+1) = total +2
            ':user': [username],
            ':emptyList': [],
          },
        }));
  
        return 2; // Liked successfully after disliking
      }
  
      console.log(`First-time like for user ${username}`);
  
      // First-time like (user is in neither liked_by nor disliked_by)
      await documentClient.send(new UpdateCommand({
        TableName,
        Key: {
          post_id: post_id,
          creation_time: creation_time,
        },
        UpdateExpression: 'SET likes = likes + :inc, liked_by = list_append(if_not_exists(liked_by, :emptyList), :user)',
        ExpressionAttributeValues: {
          ':inc': 1,  // Increment likes
          ':user': [username],
          ':emptyList': [],
        },
      }));
  
      return 1; // First-time like
    } catch (err) {
      console.error("Error liking post:", err);
      return -1; // Failure case
    }
  }
  
  /**
   * Dislikes a post by adding the username to the 'disliked_by' set and updating 'likes' counter
   */
  async function dislikePost(post_id, creation_time, username) {
    try {
      // Fetch the post first to get current liked_by and disliked_by lists
      const postData = await documentClient.send(new GetCommand({
        TableName,
        Key: {
          post_id: post_id,
          creation_time: creation_time,
        },
        ProjectionExpression: 'liked_by, disliked_by',
      }));
  
      if (!postData.Item) {
        console.log(`Post with id ${post_id} not found`);
        return 0; // Post not found
      }
  
      const post = postData.Item;
      const likedBy = post.liked_by || [];
      const dislikedBy = post.disliked_by || [];
  
      console.log(`Liked By: ${likedBy}`);
      console.log(`Disliked By: ${dislikedBy}`);
  
      // Check if user already disliked the post
      if (dislikedBy.includes(username)) {
        const index = dislikedBy.indexOf(username);
  
        console.log(`Undisliking post for user ${username}`);
  
        // Undislike the post by removing the user from disliked_by
        await documentClient.send(new UpdateCommand({
          TableName,
          Key: {
            post_id: post_id,
            creation_time: creation_time,
          },
          UpdateExpression: 'SET likes = likes + :inc REMOVE disliked_by[' + index + ']',
          ExpressionAttributeValues: {
            ':inc': 1,
          },
        }));
  
        return 3; // Undisliked successfully
      }
  
      // Check if user previously liked the post
      if (likedBy.includes(username)) {
        const index = likedBy.indexOf(username);
  
        console.log(`Switching from like to dislike for user ${username}`);
  
        // Switch from like to dislike
        await documentClient.send(new UpdateCommand({
          TableName,
          Key: {
            post_id: post_id,
            creation_time: creation_time,
          },
          UpdateExpression: 'SET likes = likes - :inc, disliked_by = list_append(if_not_exists(disliked_by, :emptyList), :user) REMOVE liked_by[' + index + ']',
          ExpressionAttributeValues: {
            ':inc': 2, // Undo like (+1) and add dislike (-1) = total -2
            ':user': [username],
            ':emptyList': [],
          },
        }));
  
        return 2; // Disliked successfully after liking
      }
  
      console.log(`First-time dislike for user ${username}`);
  
      // First-time dislike (user is in neither liked_by nor disliked_by)
      await documentClient.send(new UpdateCommand({
        TableName,
        Key: {
          post_id: post_id,
          creation_time: creation_time,
        },
        UpdateExpression: 'SET likes = likes - :inc, disliked_by = list_append(if_not_exists(disliked_by, :emptyList), :user)',
        ExpressionAttributeValues: {
          ':inc': 1,  // Decrement likes
          ':user': [username],
          ':emptyList': [],
        },
      }));
  
      return 1; // First-time dislike
    } catch (err) {
      console.error("Error disliking post:", err);
      return -1; // Failure case
    }
  }
  
module.exports = {
    deletePostById,
    getAllPosts,
    getPostById,
    getPostsByParentId,
    getNewestPost,
    createPost,
    removeParent,
    getPostsByWrittenBy
}

