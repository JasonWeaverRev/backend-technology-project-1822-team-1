require("dotenv").config();
const express = require("express");
const app = express();
const { logger } = require("./backend/utils/logger");

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
