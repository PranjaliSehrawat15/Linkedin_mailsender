const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const dbPath = path.join(__dirname, '..', 'database', 'automation.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    logger.info('SQLite database connected', { path: dbPath });
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  
  // Seed settings from environment variables/config if empty
  const config = require('../config/config');
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  if (!settings) {
    db.prepare(`
      INSERT INTO settings (id, linkedinEmail, linkedinPassword, gmailEmail, gmailAppPassword, userName)
      VALUES (1, ?, ?, ?, ?, ?)
    `).run(
      config.linkedin.email || null,
      config.linkedin.password || null,
      config.gmail.email || null,
      config.gmail.appPassword || null,
      config.userName || 'Your Name'
    );
    logger.info('Database settings seeded from config/environment variables');
  }
  logger.info('Database schema initialized');
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
    logger.info('Database connection closed');
  }
}

module.exports = { getDb, closeDb };
