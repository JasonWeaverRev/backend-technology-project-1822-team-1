/**
 * Middleware class that will facilitate API interactions through the /post endpoint
 */
const express = require("express");
const postRouter = express.Router();

// Local project imports
const postService = require('../service/postService');
const {verifyToken, verifyAdminToken} = require('../middleware/authMiddleware');

/**
 * Delete a specific post through Admin
 */
postRouter.delete('/', verifyAdminToken, async (req, res) => {
    
    const {post_id} = req.body;

    try {
        await postService.deletePostById(post_id);

        res.status(200).json({message: `Successfully deleted the post!`});
    } catch(err) {
        res.status(err.status || 400).json({ message: err.message });
    }

});

/**
 * Add a new post
 */
postRouter.post('/', verifyToken, async (req, res) => {

    try {
        const data = await postService.createPost(req.body, req.user);
        res.status(201).json({message: `Successfully created new post!`, PostInformation: req.body});

    } catch (err) {
        res.status(err.status || 400).json({message: err.message});
    }
});

/**
 * Add a new reply comment
 */
postRouter.post('/:postId', verifyToken, async (req, res) => {
    
    try {
        const data = await postService.createReply(req.body, req.params.postId, req.user);
        res.status(201).json({message: `Successfully created new post!`, PostInformation: req.body});

    } catch (err) {
        res.status(err.status || 400).json({message: err.message});
    }
});




module.exports = postRouter;