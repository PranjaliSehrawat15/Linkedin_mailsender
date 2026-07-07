const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, url: req.url, method: req.method });

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File size exceeds the 5MB limit',
    });
  }

  // Multer file type error
  if (err.message === 'Only PDF and DOCX files are allowed') {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;
