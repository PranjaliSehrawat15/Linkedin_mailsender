const { getDb } = require('../database/db');
const logger = require('../utils/logger');

// Get all recruiters
exports.getRecruiters = (req, res) => {
  try {
    const db = getDb();
    const recruiters = db.prepare('SELECT * FROM recruiters ORDER BY createdAt DESC').all();
    res.json({ success: true, data: recruiters });
  } catch (error) {
    logger.error('Failed to fetch recruiters', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch recruiters' });
  }
};

// Get a single recruiter
exports.getRecruiter = (req, res) => {
  try {
    const db = getDb();
    const recruiter = db.prepare('SELECT * FROM recruiters WHERE id = ?').get(req.params.id);

    if (!recruiter) {
      return res.status(404).json({ success: false, error: 'Recruiter not found' });
    }

    res.json({ success: true, data: recruiter });
  } catch (error) {
    logger.error('Failed to fetch recruiter', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch recruiter' });
  }
};

// Delete a recruiter
exports.deleteRecruiter = (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM recruiters WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Recruiter not found' });
    }

    logger.info('Recruiter deleted', { id: req.params.id });
    res.json({ success: true, message: 'Recruiter deleted' });
  } catch (error) {
    logger.error('Failed to delete recruiter', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to delete recruiter' });
  }
};

// Update recruiter status
exports.updateRecruiterStatus = (req, res) => {
  try {
    const { status } = req.body;
    const db = getDb();
    const result = db
      .prepare('UPDATE recruiters SET status = ? WHERE id = ?')
      .run(status, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Recruiter not found' });
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    logger.error('Failed to update recruiter', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to update recruiter' });
  }
};
