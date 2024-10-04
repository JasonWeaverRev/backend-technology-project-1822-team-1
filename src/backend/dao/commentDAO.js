const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const documentClient = DynamoDBDocumentClient.from(client);

const TableName = 'Delver_Forum_Posts';

/**
 * Function to get a post by ID from DynamoDB
 */
const getPostById = async (postID, creationTime) => {
    console.log(`Fetching post with ID: ${postID} and creation time: ${creationTime}`);

    try {
        const command = new GetCommand({
            TableName: TableName,
            Key: {
                post_id: postID,
                creation_time: creationTime
            }
        });

        const result = await documentClient.send(command);

        if (!result.Item) {
            console.log("No post found with this postID and creationTime.");
            return null;  // Post not found
        }

        console.log("Post retrieved:", JSON.stringify(result.Item, null, 2));
        return result.Item;
    } catch (err) {
        console.error("Error fetching post by ID:", err);
        return null;
    }
};

const getCommentById = async (commentID) => {
    console.log(`Fetching comment with ID: ${commentID}`);

    try {
        const command = new QueryCommand({
            TableName: TableName,
            KeyConditionExpression: 'post_id = :commentID',
            ExpressionAttributeValues: {
                ':commentID': commentID
            }
        });

        const result = await documentClient.send(command);

        if (!result.Items || result.Items.length === 0) {
            console.log("No comment found with this commentID.");
            return null;  // Comment not found
        }

        // Assuming there's only one comment per post_id
        const comment = result.Items[0];
        console.log("Comment retrieved:", JSON.stringify(comment, null, 2));
        return comment;
    } catch (err) {
        console.error("Error fetching comment by ID:", err);
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
const deleteCommentByUser = async (postID, postCreationTime, commentID) => {
    console.log(`Fetching post with ID: ${postID} and post creation time: ${postCreationTime}`);
    
    // Fetch the post
    const post = await getPostById(postID, postCreationTime);
    if (!post) {
        console.log("Post not found.");
        return 0;  // Post not found
    }

    // Find the index of the comment ID in the replies array
    const commentIndex = post.replies.indexOf(commentID);
    if (commentIndex === -1) {
        console.log("Comment ID not found in replies.");
        return 0;  // Comment not found
    }

    // Remove the comment ID from the replies array
    post.replies.splice(commentIndex, 1);
    console.log('Updated replies array after removing comment:', JSON.stringify(post.replies, null, 2));

    // Update the post in DynamoDB
    const updateCommand = new UpdateCommand({
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
        await documentClient.send(updateCommand);
        console.log("Replies array updated successfully.");
    } catch (err) {
        console.error("Error updating replies array:", err);
        return -2;  // Error during update
    }

    // Fetch the comment to get creation_time
    const comment = await getCommentById(commentID);

    if (!comment) {
        console.log("Comment not found for deletion.");
        return 0;  // Comment not found
    }

    // Delete the comment from the table
    const deleteCommand = new DeleteCommand({
        TableName: TableName,
        Key: {
            post_id: commentID,
            creation_time: comment.creation_time
        }
    });

    try {
        await documentClient.send(deleteCommand);
        console.log("Comment deleted successfully.");
        return 1;  // Successfully deleted
    } catch (err) {
        console.error("Error deleting comment:", err);
        return -2;  // Error during deletion
    }
};

module.exports = {
    updateCommentByUser,
    deleteCommentByUser,
    getCommentById,
    getPostById
};
