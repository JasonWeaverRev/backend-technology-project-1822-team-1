// Module imports
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

// Local project import
const { logger } = require("./backend/utils/logger");
const postRouter = require("./backend/controller/postController.js");
const commentRouter = require("./backend/controller/commentController");
const accountController = require("./backend/controller/accountController.js");
const encounterController = require("./backend/controller/encounterController.js");

/**
 * Server Port and general setup
 */
const PORT = process.env.PORT || 4000;
app.use(express.json());

function loggerMiddleware(req, res, next) {
  logger.info(`Incoming ${req.method} : ${req.url}`);
  next();
}

app.use(loggerMiddleware);
app.use(cors());
app.options("*", cors()); // Allow preflight requests from any origin

app.use((req, res, next) => {
  console.log("Request received:");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Headers:", req.headers);
  next();
});

/**
 * Routing setup
 */
app.use("/api/accounts", accountController);
app.use("/api/forums", postRouter);
app.use("/api/forums/comments", commentRouter);
app.use("/api/encounters", encounterController);

// Port listen
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
