// Module imports
require("dotenv").config();
const express = require("express");
const app = express();

// Local project import
const { logger } = require("./backend/utils/logger");
<<<<<<< HEAD
const postRouter = require('./backend/controller/postController.js');
const commentRouter = require("./backend/controller/commentController");
const accountController = require("./backend/controller/accountController.js");
=======
const encounterController = require("./backend/controller/encounterController");
const postRouter = require("./backend/controller/postController.js");
const accountController = require("./backend/controller/AccountController");
>>>>>>> merge-US2-US3-US4

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
<<<<<<< HEAD
app.use("/api/accounts", accountController);
app.use('/api/forums', postRouter);
app.use('/api/forums/comments', commentRouter);


=======
app.use("/api/forums", postRouter);
app.use("/api/accounts", accountController);
app.use("/api/encounters", encounterController);
>>>>>>> merge-US2-US3-US4

// Port listen
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
