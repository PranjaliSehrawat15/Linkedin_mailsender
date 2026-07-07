const { getDb } = require('../database/db');
const logger = require('../utils/logger');

exports.getSettings = (req, res) => {
  try {
    const db = getDb();
    let settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();

    if (!settings) {
      // Create empty settings row
      db.prepare('INSERT INTO settings (id) VALUES (1)').run();
      settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    }

    // Mask passwords for security before sending to frontend
    if (settings) {
      if (settings.linkedinPassword) settings.linkedinPassword = '••••••••';
      if (settings.gmailAppPassword) settings.gmailAppPassword = '••••••••';
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    logger.error('Failed to fetch settings', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
};

exports.updateSettings = (req, res) => {
  try {
    const { linkedinEmail, linkedinPassword, gmailEmail, gmailAppPassword, userName } = req.body;
    const db = getDb();

    // Ensure row exists
    const existing = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    if (!existing) {
      db.prepare('INSERT INTO settings (id) VALUES (1)').run();
    }

    // Build update query dynamically based on what was provided
    // If a password field is empty string, we DON'T update it (it means the user didn't change it).
    // If they actually want to clear it, they'll have to send null, but we'll assume empty string means ignore.

    const updates = [];
    const values = [];

    if (linkedinEmail !== undefined) {
      updates.push('linkedinEmail = ?');
      values.push(linkedinEmail);
    }
    if (linkedinPassword !== undefined && linkedinPassword !== '') {
      updates.push('linkedinPassword = ?');
      values.push(linkedinPassword);
    }
    if (gmailEmail !== undefined) {
      updates.push('gmailEmail = ?');
      values.push(gmailEmail);
    }
    if (gmailAppPassword !== undefined && gmailAppPassword !== '') {
      updates.push('gmailAppPassword = ?');
      values.push(gmailAppPassword);
    }
    if (userName !== undefined) {
      updates.push('userName = ?');
      values.push(userName);
    }

    if (updates.length > 0) {
      updates.push('updatedAt = CURRENT_TIMESTAMP');
      
      const sql = `UPDATE settings SET ${updates.join(', ')} WHERE id = 1`;
      db.prepare(sql).run(...values);
    }

    logger.info('Settings updated');
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    logger.error('Failed to update settings', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
};
