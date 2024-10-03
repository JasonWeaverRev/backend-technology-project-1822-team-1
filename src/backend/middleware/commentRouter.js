const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController'); // Import the controller
const verifyToken = require('../middleware/authMiddleware');  // Middleware for authentication
const validateComment = require('../middleware/validateComment');    // Middleware for validation

/**
 * Route to update a comment by the user
 * Authentication and validation are handled by middleware
 */
router.put('/comment', verifyToken, validateComment, commentController.updateComment);

/**
 * Route to delete a comment by the user
 * Authentication and validation are handled by middleware
 */
router.delete('/comment', verifyToken, validateComment, commentController.deleteComment);

module.exports = router;