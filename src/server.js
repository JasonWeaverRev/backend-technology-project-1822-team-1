require("dotenv").config();
const express = require("express");
const app = express();
const { logger } = require("./backend/utils/logger");
const accountController = require("./backend/controller/AccountController");

app.use(express.json());

app.use("/api/accounts", accountController);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
