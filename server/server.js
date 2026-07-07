const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const logger = require('./utils/logger');
const { getDb, closeDb } = require('./database/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const searchRoutes = require('./routes/searchRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const emailRoutes = require('./routes/emailRoutes');
const historyRoutes = require('./routes/historyRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for uploaded resumes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/search', searchRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/resumes', uploadRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', (req, res, next) => {
  // Redirect analytics to history controller
  const historyController = require('./controllers/historyController');
  historyController.getAnalytics(req, res, next);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const PORT = config.port;

// Initialize database on startup
getDb();

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down...');
  closeDb();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  closeDb();
  server.close(() => {
    process.exit(0);
  });
});

module.exports = app;
