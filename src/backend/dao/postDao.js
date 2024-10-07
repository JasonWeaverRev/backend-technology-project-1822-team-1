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
 * TABLE METHODS
 */

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
 * Adds a reply post_id to the parent
 * 
 * @param replyID ID to add to the parent's reply list
 * @param parent_id ID of parent post
 * @param crTime creation time of the parent post
 */
async function addReplyToParentList(replyID, parent_id, crTime) {
    const command = new UpdateCommand( {
        TableName,
        Key: {
            post_id: parent_id,
            creation_time: crTime
        },
        UpdateExpression: 'SET replies = list_append(if_not_exists(replies, :emptyList), :newString)',
        ExpressionAttributeValues: {
            ":newString": [replyID],
            ":emptyList": []
        }
    });

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
 * Removes a reply post_id from the replies list of a parent post 
 * 
 * @param replyID reply id to be removed
 * @param parent_id post id of the post containing the replies list
 * @param crTime parent post creation time (for sort key specification)
 */
async function removeReplyFromParent(replyID, parent_id, crTime) {
   
    // Get index of reply post inside the parent's replies list
    const parent_post = await getPostById(parent_id);
    const ind = parent_post.replies.indexOf(replyID); 
   
    // Update command to remove the index in the replies list
    const command = new UpdateCommand ( {
        TableName,
        Key: {
            post_id: parent_id,
            creation_time: crTime
        },
        UpdateExpression: `REMOVE #replies[${ind}]`,
        ExpressionAttributeNames: {
            '#replies': 'replies'
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
const removeParent = async(replyID) => {
    // Get child post to access sort key
    const child_post = await getPostById(replyID);

    const command = new UpdateCommand ( {
        TableName,
        Key: {
            post_id: replyID,
            creation_time: child_post.creation_time
        },
        UpdateExpression: "set parent_id = :status",
        ExpressionAttributeValues: {
            ":status": ""
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

module.exports = {
    deletePostById,
    getPostById,
    createPost,
    addReplyToParentList,
    removeReplyFromParent,
    removeParent
}