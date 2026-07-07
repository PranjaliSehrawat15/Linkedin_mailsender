const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  linkedin: {
    email: process.env.LINKEDIN_EMAIL,
    password: process.env.LINKEDIN_PASSWORD,
  },
  gmail: {
    email: process.env.GMAIL_EMAIL,
    appPassword: process.env.GMAIL_APP_PASSWORD,
  },
  userName: process.env.USER_NAME || 'User',
  uploadDir: path.join(__dirname, '..', 'uploads'),
  maxFileSize: 5 * 1024 * 1024, // 5MB
};
