// Module imports
require("dotenv").config();
const express = require("express");
const app = express();

// Local project import
const postRouter = require('../middleware/postRouter.js');


/**
 * General middleware setup
 */
app.use(express.json());

/**
 * Server routing stemming from the /api resource
 */
app.use('/posts', postRouter);