/**
 * Middleware class that will facilitate API interactions through the /post endpoint
 */
const express = require("express");
const postRouter = express.Router();

// Local project imports
const postService = require('../service/postService');

/**
 * Delete a specific post
 */
postRouter.delete('/', async (req, res) => {
    const data = await postService.deletePostByIdAdmin(req.body);

    if (data === -1) {
        res.status(400).json({message: `Error: Please input a valid post ID [post_id = 'id']`});
    }
    else if (data === 0) {
        res.status(404).json({message: `Error: Post was not found`});
    }
    else if (data === -2) {
        res.status(400).json({message: `Error: Post deletion encountered a problem`});
    }
    else if (data === -3) {
        res.status(400).json({message: `Error: Please enter an input for deletion [post_id = 'id']`});
    }
    else {
        res.status(200).json({message: `Successfully deleted the post!`});
    }

});


module.exports = postRouter;