require("dotenv").config();
const express = require("express");
const app = express();
const userController = require("./backend/controller/userController");
const { logger } = require("./backend/utils/logger");

app.use(express.json());

function loggerMiddleware(req, res, next){
  logger.info(`Incoming ${req.method} : ${req.url}`);
  next();
}

app.use(loggerMiddleware);

app.use("/api/users", userController);

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
