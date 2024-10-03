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

    if (data === 0) {
        res.status(404).json({message: `Error: Post was not found`});
    }
    else if (data === -1) {
        res.status(400).json({message: `Error: Please input a valid post ID [post_id = 'id']`});
    }
    else if (data === -2) {
        res.status(400).json({message: `Error: Post deletion encountered a problem`});
    }
    else {
        res.status(200).json({message: `Successfully deleted the post!`});
    }

});

/**
 * Add a new post
 */
postRouter.post('/', async (req, res) => {
    const data = await postService.createPost(req.body);
    if (data) {
        res.status(201).json({message: `Successfully created new post!`, PostInformation: req.body});
    }
    else {
        res.status(400).json({message: `Error: Post could not be created`, receivedData: req.body});
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