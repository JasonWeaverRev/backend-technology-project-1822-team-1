const express = require('express');
const router = express.Router();
const commentService = require('../services/commentService');


const commentService = require('../services/commentService');

/**
 * Controller to handle updating a comment
 */
const updateComment = async (req, res) => {
    const { postID, creationTime, newCommentText } = req.body;
    const username = req.user.username;  // Get the username from the authenticated user

    const result = await commentService.updateComment(postID, creationTime, newCommentText, username);

    if (result === 1) {
        return res.status(200).json({ message: 'Comment updated successfully' });
    } else if (result === -1) {
        return res.status(403).json({ message: 'Forbidden: You are not authorized to update this comment.' });
    } else if (result === 0) {
        return res.status(404).json({ message: 'Comment not found.' });
    } else {
        return res.status(500).json({ message: 'Failed to update comment' });
    }
};

/**
 * Controller to handle deleting a comment
 */
const deleteComment = async (req, res) => {
    const { postID, creationTime } = req.body;
    const username = req.user.username;  // Get the username from the authenticated user

    const result = await commentService.deleteComment(postID, creationTime, username);

    if (result === 1) {
        return res.status(200).json({ message: 'Comment deleted successfully' });
    } else if (result === -1) {
        return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this comment.' });
    } else if (result === 0) {
        return res.status(404).json({ message: 'Comment not found.' });
    } else {
        return res.status(500).json({ message: 'Failed to delete comment' });
    }
};

module.exports = {
    updateComment,
    deleteComment
};







