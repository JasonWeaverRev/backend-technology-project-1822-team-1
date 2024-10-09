const express = require('express');
const commentRouter = express.Router();

const commentService = require('../service/commentService');
const { verifyToken } = require('../middleware/authMiddleware');
const validateComment = require('../middleware/validateComment');

/**
 * Delete a specific comment
 */
commentRouter.delete('/:post_id/:creation_time', verifyToken, async (req, res) => {
  const { post_id, creation_time } = req.params;  // Extract from URL
  const username = req.user.username;

  // Validate required parameters
  if (!post_id || !creation_time) {
    return res.status(400).json({ message: 'post_id and creation_time are required.' });
  }

  try {
    const result = await commentService.deleteComment(post_id, creation_time, username);

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
    console.error("Error deleting comment:", err);
    res.status(err.status || 500).json({ message: 'Internal Server Error' });
  }
});
/**
 * Update an existing comment
 */
commentRouter.put('/', verifyToken, validateComment, async (req, res) => {
  console.log('PUT /api/forum/comment handler called');

  const { comment_id, comment_creation_time, body } = req.body;
  const username = req.user.username;

  if (!comment_id || !comment_creation_time || !body) {
    console.log('Missing required fields');
    return res.status(400).json({ message: 'comment_id, comment_creation_time, and body are required.' });
  }

  try {
    const result = await commentService.updateComment(comment_id, comment_creation_time, body, username);

    console.log(`Update result: ${result}`);

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
    console.error("Error updating comment:", err);
    res.status(err.status || 500).json({ message: 'Internal Server Error' });
  }
});

module.exports = commentRouter;
