const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "../../logs/requests.log");

const logger = (req, res, next) => {
  const log = `${new Date().toISOString()} | ${req.method} ${
    req.originalUrl
  } | ${req.headers.origin || "unknown"}\n`;

  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
  fs.appendFileSync(logFilePath, log);

  console.log(req.method, req.originalUrl);
  next();
};

module.exports = logger;
