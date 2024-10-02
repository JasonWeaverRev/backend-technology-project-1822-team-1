// Module imports
require("dotenv").config();
const express = require("express");
const app = express();
const apiRouter = express.Router();

// Local project import
const postRouter = require('../middleware/postRouter.js');
const postService = require('../service/postService');




/**
 * Server routing stemming from the /api resource
 */
app.use('/forum', postRouter);

module.exports = apiRouter;