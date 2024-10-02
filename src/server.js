// Module imports
require("dotenv").config();

// Local project import
const { logger } = require("./backend/utils/logger");
const app = require('./backend/controller/apiController.js');


/**
 * Server Port and general setup
 */
const PORT = 3000;


app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
