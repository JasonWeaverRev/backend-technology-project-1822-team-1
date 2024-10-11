/**
 * Middleware class that will facilitate API interactions through the /post endpoint
 */
const express = require("express");
const postRouter = express.Router();

// Local project imports
const postService = require("../service/postService");
const {
  verifyToken,
  verifyAdminToken,
} = require("../middleware/authMiddleware");

/**
 * Add a new post
 */
postRouter.post("/", verifyToken, async (req, res) => {
  try {
    const data = await postService.createPost(req.body, req.user);
    res
      .status(201)
      .setHeader("Access-Control-Allow-Origin", "*")
      .json({
        message: `Successfully created new post!`,
        PostInformation: req.body,
      });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

/**
 * Like a post
 */
postRouter.post("/like", verifyToken, async (req, res) => {
  const { post_id } = req.body;
  const username = req.user.username;

  if (!post_id) {
    return res.status(400).json({ message: "post_id is required." });
  }

  try {
    // Call the service to like/unlike the post and store the result
    const result = await postService.likePost(post_id, username);

    // Handle the response based on the result value
    if (result === 1) {
      return res
        .status(200)
        .setHeader("Access-Control-Allow-Origin", "*")
        .json({ message: "Post liked successfully." });
    } else if (result === 3) {
      return res
        .status(200)
        .setHeader("Access-Control-Allow-Origin", "*")
        .json({ message: "Post unliked successfully." });
    } else {
      return res.status(500).json({ message: "Failed to update like status." });
    }
  } catch (err) {
    // Send error status and message if something goes wrong
    res.status(err.status || 500).json({ message: err.message });
  }
});

/**
 * Dislike a post
 */
postRouter.post("/dislike", verifyToken, async (req, res) => {
  const { post_id } = req.body;
  const username = req.user.username;

  if (!post_id) {
    return res.status(400).json({ message: "post_id is required." });
  }

  try {
    const result = await postService.dislikePost(post_id, username);
    console.log("Dislike service result:", result);

    return res
      .status(result.status)
      .setHeader("Access-Control-Allow-Origin", "*")
      .json({ message: result.message });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

//end of post interaction

/**
 * Add a new reply comment
 */
postRouter.post("/:postId", verifyToken, async (req, res) => {
  try {
    const data = await postService.createReply(
      req.body,
      req.params.postId,
      req.user
    );
    res
      .status(201)
      .setHeader("Access-Control-Allow-Origin", "*")
      .json({
        message: `Successfully created new post!`,
        PostInformation: req.body,
      });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

/**
 * Delete a specific post through Admin
 */
postRouter.delete("/:postId", verifyAdminToken, async (req, res) => {
  try {
    await postService.deletePostById(req.params.postId);

    res
      .status(200)
      .setHeader("Access-Control-Allow-Origin", "*")
      .json({ message: `Successfully deleted the post!` });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

/**
 * Get a list of posts, sorted in descending order, 6 at a time
 *
 * :page = 1: 6 posts
 * :page = 2: 12 posts
 * :page = 3: 18 posts
 */
postRouter.get("/landing", async (req, res) => {
  const { page } = req.query;

  try {
    const posts = await postService.getPostsSorted(page);
    res.status(201).setHeader("Access-Control-Allow-Origin", "*").json(posts);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

module.exports = postRouter;
