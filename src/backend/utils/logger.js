const { createLogger, transports, format } = require("winston");

// create the logger instance
const logger = createLogger({
  level: "info", // log only messages with level 'info' and above
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // log to the console
    new transports.File({ filename: "app.log" }), // log to a file
  ],
});

const sendData = ({ res, statusCode, message, endingData }) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: message, endingData }));
};

module.exports = { logger, sendData };
