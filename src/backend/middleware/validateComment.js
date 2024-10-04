/**
 * Middleware to validate the request body for comment operations
 */
const validateComment = (req, res, next) => {
    const { postID, creationTime, newCommentText } = req.body;

    // Check if postID and creationTime are present for both PUT and DELETE requests
    if (!postID || !creationTime) {
        return res.status(400).json({ message: "postID and creationTime are required." });
    }

    // For PUT requests (update), ensure newCommentText is present
    if (req.method === 'PUT' && !newCommentText) {
        return res.status(400).json({ message: "newCommentText is required for updating comments." });
    }

    next(); // Proceed to the next middleware or controller
};

module.exports = validateComment;
