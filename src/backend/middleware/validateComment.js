/**
 * Middleware to validate the request body for comment operations
 */
const validateComment = (req, res, next) => {
    console.log('ValidateComment middleware called');
    console.log('Request body:', req.body);

    const { comment_id, comment_creation_time, body } = req.body;

    // For both PUT and DELETE requests, ensure comment_id and comment_creation_time are present
    if (!comment_id || !comment_creation_time) {
        return res.status(400).json({ message: "comment_id and comment_creation_time are required." });
    }

    // For PUT requests (update), ensure body is present
    if (req.method === 'PUT' && !body) {
        return res.status(400).json({ message: "body is required for updating comments." });
    }

    next(); // Proceed to the next middleware or controller
};

module.exports = validateComment;
