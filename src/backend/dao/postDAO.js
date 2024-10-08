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
    // Get child post to access sort key
  

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
      // Read the post first
      const getCommand = new GetCommand({
        TableName,
        Key: {
          post_id: post_id,
          creation_time: creation_time,
        },
        ProjectionExpression: 'liked_by, disliked_by, #likes',
        ExpressionAttributeNames: {
          '#likes': 'likes',
        },
      });
      const postData = await documentClient.send(getCommand);
  
      if (!postData.Item) {
        return 0; // Post not found
      }
  
      const post = postData.Item;
  
      // Ensure 'liked_by' and 'disliked_by' are arrays
      const likedBy = post.liked_by || [];
      const dislikedBy = post.disliked_by || [];
  
      if (likedBy.includes(username)) {
        return -1; // Already liked
      }
  
      let likesIncrement = 1;
      let updateExpression = 'SET #likes = #likes + :inc, liked_by = list_append(if_not_exists(liked_by, :emptyList), :user)';
      let expressionAttributeValues = {
        ':inc': likesIncrement,
        ':user': [username],
        ':emptyList': [],
      };
      let expressionAttributeNames = {
        '#likes': 'likes',
      };
  
      if (dislikedBy.includes(username)) {

        // User had previously disliked the post
        likesIncrement = 2;    
        const index = dislikedBy.indexOf(username);

        updateExpression = 'SET #likes = #likes + :inc, liked_by = list_append(if_not_exists(liked_by, :emptyList), :user) REMOVE disliked_by[' + index + ']';
      }
  
      // Update the post
      const updateCommand = new UpdateCommand({
        TableName,
        Key: {
          post_id: post_id,
          creation_time: creation_time,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      });
  
      await documentClient.send(updateCommand);
  
      return 1; // Success
    } catch (err) {
      logger.error("Error liking post:", err);
      return -2; // Failure
    }
  }

  /**
   * Dislikes a post by adding the username to the 'disliked_by' set and updating 'likes' counter
   */
  async function dislikePost(post_id, creation_time, username) {
  try {
    // Read the post first
    const getCommand = new GetCommand({
      TableName,
      Key: {
        post_id: post_id,
        creation_time: creation_time,
      },
      ProjectionExpression: 'liked_by, disliked_by, #likes',
      ExpressionAttributeNames: {
        '#likes': 'likes',
      },
    });
    const postData = await documentClient.send(getCommand);

    if (!postData.Item) {
      return 0; // Post not found
    }

    const post = postData.Item;

    // Ensure 'liked_by' and 'disliked_by' are arrays
    const likedBy = post.liked_by || [];
    const dislikedBy = post.disliked_by || [];

    // Check if the user has already disliked the post
    if (dislikedBy.includes(username)) {
      return -1; // Already disliked
    }

    let likesIncrement = -1; // Default decrement by 1 for dislike
    let updateExpression = 'SET #likes = #likes + :inc, disliked_by = list_append(if_not_exists(disliked_by, :emptyList), :user)';
    let expressionAttributeValues = {
      ':inc': likesIncrement,
      ':user': [username],
      ':emptyList': [],
    };
    let expressionAttributeNames = {
      '#likes': 'likes',
    };

    // If the user previously liked the post, switch from like to dislike
    if (likedBy.includes(username)) {
       
      likesIncrement = -2; // Decrease by 2 (removing a like and adding a dislike)
      
      // Find the index of the username in the liked_by list
      const index = likedBy.indexOf(username);

      updateExpression = 'SET #likes = #likes + :inc, disliked_by = list_append(if_not_exists(disliked_by, :emptyList), :user) REMOVE liked_by[' + index + ']';


    }

    // Update the post with the new dislike
    const updateCommand = new UpdateCommand({
      TableName,
      Key: {
        post_id: post_id,
        creation_time: creation_time,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    await documentClient.send(updateCommand);

    return 1; // Success
  } catch (err) {
    logger.error("Error disliking post:", err);
    return -2; // Failure
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
    likePost, 
    dislikePost
}

