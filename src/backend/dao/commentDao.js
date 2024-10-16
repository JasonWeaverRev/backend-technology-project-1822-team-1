const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand
} = require("@aws-sdk/lib-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = 'Delver_Forum_Posts';

/**
 * Get a comment by post_id and creation_time
 */
const getCommentById = async (commentID, creationTime) => {
  if (!commentID || !creationTime) {
    console.error("commentID and creationTime are required.");
    return null;
  }

  console.log(`Fetching comment with ID: ${commentID} and creation time: ${creationTime}`);

  try {
    const command = new GetCommand({
      TableName,
      Key: {
        post_id: commentID,
        creation_time: creationTime,
      },
    });

    const result = await documentClient.send(command);

    if (!result.Item) {
      console.log("No comment found with this commentID and creationTime.");
      return null;
    }

    console.log("Comment retrieved:", JSON.stringify(result.Item, null, 2));
    return result.Item;
  } catch (err) {
    console.error("Error fetching comment by ID:", err);
    return null;
  }
};

/**
 * Update a comment's body
 */
const updateCommentByUser = async (commentID, commentCreationTime, body) => {
  if (!commentID || !commentCreationTime) {
    console.error("commentID and commentCreationTime are required.");
    return -2; // Update failed
  }

  try {
    const command = new UpdateCommand({
      TableName,
      Key: {
        post_id: commentID,
        creation_time: commentCreationTime,
      },
      UpdateExpression: 'SET #body = :body',
      ExpressionAttributeNames: {
        '#body': 'body',
      },
      ExpressionAttributeValues: {
        ':body': body,
      },
      ConditionExpression: 'attribute_exists(post_id) AND attribute_exists(creation_time)',
    });

    await documentClient.send(command);
    console.log("Comment updated successfully.");
    return 1; // Successfully updated
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      console.error("Comment does not exist.");
      return 0; // Comment not found
    }
    console.error("Error updating comment:", err);
    return -2; // Update failed
  }
};

/**
 * Delete a comment
 */
const deleteCommentByUser = async (commentID, commentCreationTime) => {
  console.log(`Deleting comment with ID: ${commentID} and creation time: ${commentCreationTime}`);

  try {
    const command = new DeleteCommand({
      TableName,
      Key: {
        post_id: commentID,
        creation_time: commentCreationTime,
      },
      ConditionExpression: 'attribute_exists(post_id) AND attribute_exists(creation_time)',
    });

    await documentClient.send(command);
    console.log("Comment deleted successfully.");
    return 1; // Successfully deleted
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      console.error("Comment does not exist.");
      return 0; // Comment not found
    }
    console.error("Error deleting comment:", err);
    return -2; // Deletion failed
  }
};

/**
 * Remove comment reference from parent post's replies
 */
const removeCommentFromParent = async (parentID, parentCreationTime, commentID, commentCreationTime) => {
  try {
    const command = new UpdateCommand({
      TableName,
      Key: {
        post_id: parentID,
        creation_time: parentCreationTime,
      },
      UpdateExpression: 'DELETE replies :commentKey',
      ExpressionAttributeValues: {
        ':commentKey': documentClient.createSet([`${commentID}#${commentCreationTime}`]),
      },
      ConditionExpression: 'attribute_exists(post_id) AND attribute_exists(creation_time)',
    });

    await documentClient.send(command);
    console.log("Comment reference removed from parent post.");
    return 1;
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      console.error("Parent post does not exist.");
      return 0; // Parent not found
    }
    console.error("Error updating parent post:", err);
    return -2; // Update failed
  }
};

/**
 * Retrieves a list of all comments attached to a specific post
 * 
 * @param {*} parentID ID of the parent to get comment replies from
 * @returns List of comments with same parent id
 */
const getCommentsByParent = async (parentID) => {
  try {
    const command = new QueryCommand({
      TableName,
      IndexName: "parent_id-post_id-index",
      KeyConditionExpression: "#parent_id = :parent_id",
      ExpressionAttributeNames: {
        "#parent_id": "parent_id",
      },
      ExpressionAttributeValues: {
        ":parent_id": parentID,
      },
    });

    const data = await documentClient.send(command);
    return data.Items;

  } catch (err) {
    console.error(err);
    throw { status: 500, message: "Error retrieving comments by their parent posts "};
  }
};


module.exports = {
  updateCommentByUser,
  deleteCommentByUser,
  getCommentById,
  removeCommentFromParent,
  getCommentsByParent
};
