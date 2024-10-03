// Module imports
require("dotenv").config();
const express = require("express");
const app = express();
const userController = require("./backend/controller/userController");

// Local project import
const { logger } = require("./backend/utils/logger");
const postRouter = require('./backend/controller/postRouter.js');


/**
 * Server Port and general setup
 */
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.use("/api/users", userController);



/**
 * Routing setup
 */
app.use('/api/forum', postRouter);


// Port listen
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
