// Importing DynamoDB client and document client for operations
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand
} = require("@aws-sdk/lib-dynamodb");

// Import your logger or other utilities as needed
const { logger } = require("../utils/logger");

// Create DynamoDB and Document Client instances
const client = new DynamoDBClient({ region: "us-east-1" });
const documentClient = DynamoDBDocumentClient.from(client);

// Define your table name (replace with the actual table name you're using)
const TableName = 'Delver_Forum_Posts';

const updateCommentByUser = async (postID, creationTime, newCommentText) => {
    const command = new UpdateCommand({
        TableName: 'Delver_Forum_Posts',
        Key: {
            post_id: postID,
            creation_time: creationTime // Post's creation time, not the comment's
        },
        UpdateExpression: 'SET comments[$commentIndex].body = :newBody',
        ConditionExpression: 'comments[$commentIndex].creation_time = :commentCreationTime',
        ExpressionAttributeValues: {
            ':newBody': newCommentText,
            ':commentCreationTime': creationTime // This is the comment's creation time
        }
    });

    try {
        const data = await documentClient.send(command);
        return data;
    } catch (err) {
        console.error(err);
    }
};

const deleteCommentByUser = async (postID, commentCreationTime) => {
    const post = await getPostById(postID);  // Fetch the post containing the comment
    const commentIndex = post.comments.findIndex(c => c.creation_time === commentCreationTime);
    
    if (commentIndex === -1) {
        return 0;  // Comment not found
    }

    const command = new UpdateCommand({
        TableName: 'Delver_Forum_Posts',
        Key: {
            post_id: postID,
            creation_time: post.creation_time  // Post's creation time
        },
        UpdateExpression: `REMOVE comments[${commentIndex}]`
    });

    try {
        const data = await documentClient.send(command);
        return 1;  // Successfully deleted
    } catch (err) {
        console.error(err);
        return -2;  // Deletion failed
    }
};
