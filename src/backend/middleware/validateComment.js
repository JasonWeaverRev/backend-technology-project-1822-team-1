// Middleware to validate the request body for updating or deleting a comment
const validateComment = (req, res, next) => {
    const { postID, creationTime, newCommentText } = req.body;

    // Check if postID and creationTime are present
    if (!postID || !creationTime) {
        return res.status(400).json({ message: 'postID and creationTime are required.' });
    }

    // Check if newCommentText is present for updating comments (PUT request)
    if (req.method === 'PUT' && !newCommentText) {
        return res.status(400).json({ message: 'newCommentText is required for updating comments.' });
    }

    // If validation passes, proceed to the next middleware or controller
    next();
};

module.exports = validateComment;