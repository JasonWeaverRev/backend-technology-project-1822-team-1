const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    GetCommand,
    UpdateCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = 'Delver_Forum_Posts';

/**
 * Function to get a post by ID from DynamoDB
 */
const getPostById = async (postID, postCreationTime) => {
    console.log(`Fetching post with ID: ${postID} and creation time: ${postCreationTime}`);

    try {
        const command = new GetCommand({
            TableName: TableName,
            Key: {
                post_id: postID,
                creation_time: postCreationTime
            }
        });

        const result = await documentClient.send(command);

        if (!result.Item) {
            console.log("No post found with this postID and creationTime.");
            return null;  // Post not found
        }

        console.log("Post retrieved:", JSON.stringify(result.Item, null, 2));
        return result.Item;  // Return the post object
    } catch (err) {
        console.error("Error fetching post by ID:", err);
        return null;
    }
};

/**
 * Update a comment if it exists in the post
 */
const updateCommentByUser = async (postID, postCreationTime, commentCreationTime, body) => {
    const post = await getPostById(postID, postCreationTime);

    if (!post) {
        return 0;  // Post not found
    }

    // Ensure the replies array exists
    if (!Array.isArray(post.replies)) {
        console.log("Replies array not found in post.");
        return -2;  // No replies array found
    }

    const commentIndex = post.replies.findIndex(reply => reply.creation_time === commentCreationTime);

    if (commentIndex === -1) {
        return 0;  // Comment not found
    }

    // Update the comment's body
    post.replies[commentIndex].body = body;

    const command = new UpdateCommand({
        TableName: TableName,
        Key: {
            post_id: postID,
            creation_time: postCreationTime
        },
        UpdateExpression: 'SET replies = :updatedReplies',
        ExpressionAttributeValues: {
            ':updatedReplies': post.replies
        }
    });

    try {
        await documentClient.send(command);
        return 1;  // Successfully updated
    } catch (err) {
        console.error("Error updating comment:", err);
        return -2;  // Update failed
    }
};

/**
 * Delete a comment from a post if it exists
 */
const deleteCommentByUser = async (postID, postCreationTime, commentCreationTime) => {
    const post = await getPostById(postID, postCreationTime);

    if (!post) {
        return 0;  // Post not found
    }

    // Ensure the replies array exists
    if (!Array.isArray(post.replies)) {
        console.log("Replies array not found in post.");
        return -2;  // No replies array found
    }

    const commentIndex = post.replies.findIndex(reply => reply.creation_time === commentCreationTime);

    if (commentIndex === -1) {
        console.log("Comment not found in post.");
        return 0;  // Comment not found
    }

    // Remove the comment from the replies array
    post.replies.splice(commentIndex, 1);

    const command = new UpdateCommand({
        TableName: TableName,
        Key: {
            post_id: postID,
            creation_time: postCreationTime
        },
        UpdateExpression: 'SET replies = :updatedReplies',
        ExpressionAttributeValues: {
            ':updatedReplies': post.replies
        }
    });

    try {
        await documentClient.send(command);
        console.log("Comment deleted successfully.");
        return 1;  // Successfully deleted
    } catch (err) {
        console.error("Error during deletion:", err);
        return -2;  // Deletion failed
    }
};

module.exports = {
    updateCommentByUser,
    deleteCommentByUser,
    getPostById
};
