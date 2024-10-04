const express = require('express');
const commentRouter = express.Router();

const commentService = require('../service/commentService');
const { verifyToken } = require('../middleware/authMiddleware');
const validateComment = require('../middleware/validateComment');

/**
 * Delete a specific comment
 */
commentRouter.delete('/', verifyToken, async (req, res) => {
    const { post_id, post_creation_time, comment_id } = req.body;
    const username = req.user.username;

    try {
        const result = await commentService.deleteComment(post_id, post_creation_time, comment_id, username);

        if (result === 1) {
            return res.status(200).json({ message: 'Comment deleted successfully' });
        } else if (result === -1) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this comment.' });
        } else if (result === 0) {
            return res.status(404).json({ message: 'Comment not found.' });
        } else {
            return res.status(500).json({ message: 'Failed to delete the comment' });
        }
    } catch (err) {
        res.status(err.status || 500).json({ message: 'Internal Server Error' });
    }
});


/**
 * Update an existing comment
 */
commentRouter.put('/', verifyToken, validateComment, async (req, res) => {
    const { post_id, post_creation_time, comment_creation_time, body } = req.body;
    const username = req.user.username;

    try {
        const result = await commentService.updateComment(post_id, post_creation_time, comment_creation_time, body, username);

        if (result === 1) {
            return res.status(200).json({ message: 'Comment updated successfully' });
        } else if (result === -1) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to update this comment.' });
        } else if (result === 0) {
            return res.status(404).json({ message: 'Comment not found.' });
        } else {
            return res.status(500).json({ message: 'Failed to update the comment' });
        }
    } catch (err) {
        res.status(err.status || 500).json({ message: 'Internal Server Error' });
    }
});

module.exports = commentRouter;
