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
postRouter.post('/', async (req, res) => {

    try {
        const data = await postService.createPost(req.body);
        res.status(201).json({message: `Successfully created new post!`, PostInformation: req.body});

    } catch (err) {
        res.status(err.status || 400).json({message: err.message});
    }
});

/**
 * Add a new reply comment
 */
postRouter.post('/:postId', async (req, res) => {
    const data = await postService.createReply(req.body, req.params.postId);
   
    if (data === 0) {
        res.status(404).json({message: `Error: Reply contents not valid`});
    } 
    else if (data === -1) {
        res.status(400).json({message: `Error: Parent comment not found`, receivedData: req.body});
    } 
    else if (data == null) {
        res.status(400).json({message: `Error: Error encountered during creation`, receivedData: req.body});
    }
    else {
        res.status(201).json({message: `Successfully created new reply post!`, PostInformation: req.body});
    }
});




module.exports = postRouter;