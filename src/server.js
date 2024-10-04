require("dotenv").config();
const express = require("express");
const app = express();
const accountController = require("./backend/controller/AccountController");
const { logger } = require("./backend/utils/logger");

app.use(express.json());

app.use("/api/account", accountController);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
