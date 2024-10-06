require("dotenv").config();
const express = require("express");
const app = express();
const { logger } = require("./backend/utils/logger");
const encounterController = require("./backend/controller/encounterController");

app.use(express.json());

app.use("/api/encounters", encounterController);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
