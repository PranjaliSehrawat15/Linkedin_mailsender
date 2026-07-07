const { getDb } = require('../database/db');
const logger = require('../utils/logger');

// Get search history
exports.getHistory = (req, res) => {
  try {
    const db = getDb();
    const searches = db.prepare('SELECT * FROM searches ORDER BY searchTime DESC').all();
    res.json({ success: true, data: searches });
  } catch (error) {
    logger.error('Failed to fetch history', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
};

// Get email history
exports.getEmailHistory = (req, res) => {
  try {
    const db = getDb();
    const emails = db
      .prepare(
        `SELECT e.*, r.name as recruiterName, r.company as recruiterCompany, r.email as recruiterEmail
         FROM emails e
         LEFT JOIN recruiters r ON e.recruiterId = r.id
         ORDER BY e.sentAt DESC`
      )
      .all();
    res.json({ success: true, data: emails });
  } catch (error) {
    logger.error('Failed to fetch email history', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch email history' });
  }
};

// Get dashboard analytics
exports.getAnalytics = (req, res) => {
  try {
    const db = getDb();

    const totalSearches = db.prepare('SELECT COUNT(*) as count FROM searches').get().count;
    const totalRecruiters = db.prepare('SELECT COUNT(*) as count FROM recruiters').get().count;
    const totalEmails = db
      .prepare("SELECT COUNT(*) as count FROM emails WHERE status = 'sent'")
      .get().count;
    const todaySearches = db
      .prepare("SELECT COUNT(*) as count FROM searches WHERE date(searchTime) = date('now')")
      .get().count;

    // Weekly searches (last 7 days)
    const weeklySearches = db
      .prepare(
        `SELECT date(searchTime) as date, COUNT(*) as count 
         FROM searches 
         WHERE searchTime >= datetime('now', '-7 days')
         GROUP BY date(searchTime)
         ORDER BY date(searchTime)`
      )
      .all();

    // Weekly emails (last 7 days)
    const weeklyEmails = db
      .prepare(
        `SELECT date(sentAt) as date, COUNT(*) as count 
         FROM emails 
         WHERE status = 'sent' AND sentAt >= datetime('now', '-7 days')
         GROUP BY date(sentAt)
         ORDER BY date(sentAt)`
      )
      .all();

    res.json({
      success: true,
      data: {
        totalSearches,
        totalRecruiters,
        totalEmails,
        todaySearches,
        weeklySearches,
        weeklyEmails,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch analytics', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};
