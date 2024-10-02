require("dotenv").config();
const express = require("express");
const app = express();
const { logger } = require("./backend/utils/logger");

/**
 * Server Port and general setup
 */
app.use(express.json());
const PORT = process.env.PORT || 3000;


/**
 * API server routing
 */
app.use('/api', apiRouter);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
