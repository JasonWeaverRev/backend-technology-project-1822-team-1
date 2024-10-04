// Module imports
require("dotenv").config();
const express = require("express");
const app = express();

// Local project import
const { logger } = require("./backend/utils/logger");
const postRouter = require('./backend/controller/postController.js');
const userController = require("./backend/controller/userController");


/**
 * Server Port and general setup
 */
const PORT = process.env.PORT || 3000;
app.use(express.json());

function loggerMiddleware(req, res, next){
  logger.info(`Incoming ${req.method} : ${req.url}`);
  next();
}

app.use(loggerMiddleware);

/**
 * Routing setup
 */
app.use("/api/users", userController);
app.use('/api/forum', postRouter);


// Port listen
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
