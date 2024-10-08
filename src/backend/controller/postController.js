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
/// POST INTERACTION

/**
 * Like a post
 */
postRouter.post('/like', verifyToken, async (req, res) => {
  const { post_id } = req.body;
  const username = req.user.username;

  if (!post_id) {
    return res.status(400).json({ message: 'post_id is required.' });
  }

  try {
    // Call the service to like/unlike the post and store the result
    const result = await postService.likePost(post_id, username);

    // Handle the response based on the result value
    if (result === 1) {
      return res.status(200).json({ message: 'Post liked successfully.' });
    } else if (result === 3) {
      return res.status(200).json({ message: 'Post unliked successfully.' });
    } else {
      return res.status(500).json({ message: 'Failed to update like status.' });
    }
  } catch (err) {
    // Send error status and message if something goes wrong
    res.status(err.status || 500).json({ message: err.message });
  }
});

  
  /**
   * Dislike a post
   */
  postRouter.post('/dislike', verifyToken, async (req, res) => {
    const { post_id } = req.body;
    const username = req.user.username;
  
    if (!post_id) {
      return res.status(400).json({ message: 'post_id is required.' });
    }
  
    try {
      const result = await postService.dislikePost(post_id, username);
      console.log('Dislike service result:', result);
  
      return res.status(result.status).json({ message: result.message });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  });
  
  //end of post interaction

  
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

/**
 * Get all posts in the forums table, sorted in ascending order of their creation time []
 */
postRouter.get('/filters', async (req, res) => {
    
    try {
        const data = await postService.getAllPostsSorted();
        res.status(201).json(data);

    } catch (err) {
        res.status(err.status || 400).json({message: err.message});
    }
});

/**
 * Gets all posts from the forums
 */
postRouter.get('/', async (req, res) => {

    try {
        const data = await postService.getAllPosts();
        res.status(201).json(data);
    } catch (err) {
        res.status(err.status || 400).json({message: err.message});
    }

});






module.exports = postRouter;