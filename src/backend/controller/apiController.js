const express = require('express');
const app = express();
const commentService = require('../services/commentService');
const verifyToken = require('../middleware/authMiddleware');  // Middleware for authentication
const validateComment = require('../middleware/validateComment');  // Middleware for validation

app.use(express.json()); // Middleware to parse JSON

/**
 * Controller to handle updating or deleting a comment
 * based on the HTTP method (PUT for update, DELETE for delete)
 */
const handleComment = async (req, res) => {
    const { postID, creationTime, newCommentText } = req.body;
    const username = req.user.username; // Get the username from the authenticated user

    try {
        if (req.method === 'PUT') {
            // Handle comment update
            const result = await commentService.updateComment(postID, creationTime, newCommentText, username);

            if (result === 1) {
                return res.status(200).json({ message: 'Comment updated successfully' });
            } else if (result === -1) {
                return res.status(403).json({ message: 'Forbidden: You are not authorized to update this comment.' });
            } else if (result === 0) {
                return res.status(404).json({ message: 'Comment not found.' });
            }
        } else if (req.method === 'DELETE') {
            // Handle comment deletion
            const result = await commentService.deleteComment(postID, creationTime, username);

            if (result === 1) {
                return res.status(200).json({ message: 'Comment deleted successfully' });
            } else if (result === -1) {
                return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this comment.' });
            } else if (result === 0) {
                return res.status(404).json({ message: 'Comment not found.' });
            }
        }

        return res.status(500).json({ message: 'Failed to process the request' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Routes for updating and deleting a comment
app.put('/comment', verifyToken, validateComment, handleComment);
app.delete('/comment', verifyToken, validateComment, handleComment);

// Export the express app to use in server setup
module.exports = app;
