// Module imports
require("dotenv").config();
const express = require("express");
const app = express();

// Local project import
const postRouter = require('../middleware/postRouter.js');


/**
 * Server routing stemming from the /api resource
 */
app.use(express.json());
app.use('/api/forum', postRouter);

module.exports = app;