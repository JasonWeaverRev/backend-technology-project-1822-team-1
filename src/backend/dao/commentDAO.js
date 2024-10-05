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

const getCommentById = async (commentID, creationTime) => {
    if (!commentID || !creationTime) {
        console.error("commentID and creationTime are required.");
        return null;
    }

    console.log(`Fetching comment with ID: ${commentID} and creation time: ${creationTime}`);

    try {
        const command = new GetCommand({
            TableName: TableName,
            Key: {
                post_id: commentID,
                creation_time: creationTime
            }
        });

        const result = await documentClient.send(command);

        if (!result.Item) {
            console.log("No comment found with this commentID and creationTime.");
            return null;  // Comment not found
        }

        console.log("Comment retrieved:", JSON.stringify(result.Item, null, 2));
        return result.Item;  // Return the comment object
    } catch (err) {
        console.error("Error fetching comment by ID:", err);
        return null;
    }
};

/**
 * Update a comment if it exists in the post
 */
const updateCommentByUser = async (commentID, commentCreationTime, body) => {
    if (!commentID || !commentCreationTime) {
        console.error("commentID and commentCreationTime are required.");
        return -2;  // Update failed
    }

    const command = new UpdateCommand({
        TableName: TableName,
        Key: {
            post_id: commentID,
            creation_time: commentCreationTime
        },
        UpdateExpression: 'SET #body = :body',
        ExpressionAttributeNames: {
            '#body': 'body'
        },
        ExpressionAttributeValues: {
            ':body': body
        }
    });

    try {
        await documentClient.send(command);
        console.log("Comment updated successfully.");
        return 1;  // Successfully updated
    } catch (err) {
        console.error("Error updating comment:", err);
        return -2;  // Update failed
    }
};

/**
 * Delete a comment from a post if it exists
 */
const deleteCommentByUser = async (postID, postCreationTime, commentID, commentCreationTime) => {
    console.log(`Deleting comment with ID: ${commentID} and creation time: ${commentCreationTime} from post with ID: ${postID} and creation time: ${postCreationTime}`);
    
    // Fetch the post
    const post = await getPostById(postID, postCreationTime);
    if (!post) {
        console.log("Post not found.");
        return 0;  // Post not found
    }

    // Remove the comment ID from the replies array
    const commentIndex = post.replies.indexOf(commentID);
    if (commentIndex === -1) {
        console.log("Comment ID not found in replies.");
        return 0;  // Comment not found
    }

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

    // Delete the comment from the table
    const deleteCommand = new DeleteCommand({
        TableName: TableName,
        Key: {
            post_id: commentID,
            creation_time: commentCreationTime
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
