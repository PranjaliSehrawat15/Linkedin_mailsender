const { getDb } = require('../database/db');
const linkedinService = require('../services/linkedin/linkedinService');
const logger = require('../utils/logger');

// Start a LinkedIn search
exports.startSearch = async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({ success: false, error: 'Keyword is required' });
    }

    logger.info('Starting LinkedIn search', { keyword });

    const db = getDb();
    const startTime = Date.now();

    // Insert search record
    const searchStmt = db.prepare(
      'INSERT INTO searches (keyword, results, searchTime) VALUES (?, 0, CURRENT_TIMESTAMP)'
    );
    const searchResult = searchStmt.run(keyword.trim());
    const searchId = searchResult.lastInsertRowid;

    // Get credentials
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    if (!settings || !settings.linkedinEmail || !settings.linkedinPassword) {
      return res.status(400).json({ success: false, error: 'LinkedIn credentials are not configured. Please set them in the Settings page.' });
    }

    // Run the LinkedIn automation
    let recruiters = [];
    try {
      recruiters = await linkedinService.searchAndExtract(keyword.trim(), {
        email: settings.linkedinEmail,
        password: settings.linkedinPassword
      });
    } catch (automationError) {
      logger.error('LinkedIn automation error', { error: automationError.message });
      // Update search with error but don't fail entirely
      const duration = Math.round((Date.now() - startTime) / 1000);
      db.prepare('UPDATE searches SET results = 0, duration = ? WHERE id = ?').run(
        duration,
        searchId
      );
      return res.status(200).json({
        success: true,
        data: {
          searchId,
          keyword,
          recruiters: [],
          message: `Search completed but automation encountered an issue: ${automationError.message}`,
        },
      });
    }

    // Store recruiters in database
    const insertRecruiter = db.prepare(
      'INSERT INTO recruiters (name, company, email, linkedinPost, searchId) VALUES (?, ?, ?, ?, ?)'
    );

    const insertMany = db.transaction((items) => {
      for (const r of items) {
        insertRecruiter.run(r.name, r.company, r.email, r.postUrl, searchId);
      }
    });

    insertMany(recruiters);

    // Update search record
    const duration = Math.round((Date.now() - startTime) / 1000);
    db.prepare('UPDATE searches SET results = ?, duration = ? WHERE id = ?').run(
      recruiters.length,
      duration,
      searchId
    );

    logger.info('Search completed', {
      searchId,
      keyword,
      results: recruiters.length,
      duration,
    });

    res.json({
      success: true,
      data: {
        searchId,
        keyword,
        recruiters,
        duration,
        message: `Found ${recruiters.length} recruiter(s)`,
      },
    });
  } catch (error) {
    logger.error('Search failed', { error: error.message });
    res.status(500).json({ success: false, error: 'Search failed: ' + error.message });
  }
};
