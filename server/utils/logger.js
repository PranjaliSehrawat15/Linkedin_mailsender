const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'app.log');

const levels = { ERROR: 'ERROR', WARN: 'WARN', INFO: 'INFO', DEBUG: 'DEBUG' };

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

function writeLog(level, message, meta) {
  const formatted = formatMessage(level, message, meta);
  console.log(formatted);
  fs.appendFileSync(logFile, formatted + '\n');
}

const logger = {
  error: (msg, meta) => writeLog(levels.ERROR, msg, meta),
  warn: (msg, meta) => writeLog(levels.WARN, msg, meta),
  info: (msg, meta) => writeLog(levels.INFO, msg, meta),
  debug: (msg, meta) => writeLog(levels.DEBUG, msg, meta),
};

module.exports = logger;
