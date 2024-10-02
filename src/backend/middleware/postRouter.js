/**
 * Middleware class that will facilitate API interactions through the /post endpoint
 */
const postRouter = express.Router();

// Local project imports
const postService = require('../service/postService');




module.exports = postRouter;