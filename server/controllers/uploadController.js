const { getDb } = require('../database/db');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Upload a resume
exports.uploadResume = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO resumes (filename, originalName, path, mimetype, size) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.file.mimetype,
      req.file.size
    );

    logger.info('Resume uploaded', { id: result.lastInsertRowid, name: req.file.originalname });

    res.status(201).json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    logger.error('Upload failed', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to upload resume' });
  }
};

// Get all resumes
exports.getResumes = (req, res) => {
  try {
    const db = getDb();
    const resumes = db.prepare('SELECT * FROM resumes ORDER BY uploadedAt DESC').all();
    res.json({ success: true, data: resumes });
  } catch (error) {
    logger.error('Failed to fetch resumes', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch resumes' });
  }
};

// Delete a resume
exports.deleteResume = (req, res) => {
  try {
    const db = getDb();
    const resume = db.prepare('SELECT * FROM resumes WHERE id = ?').get(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Delete file from disk
    if (fs.existsSync(resume.path)) {
      fs.unlinkSync(resume.path);
    }

    db.prepare('DELETE FROM resumes WHERE id = ?').run(req.params.id);
    logger.info('Resume deleted', { id: req.params.id });
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    logger.error('Failed to delete resume', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to delete resume' });
  }
};

// Download a resume
exports.downloadResume = (req, res) => {
  try {
    const db = getDb();
    const resume = db.prepare('SELECT * FROM resumes WHERE id = ?').get(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    if (!fs.existsSync(resume.path)) {
      return res.status(404).json({ success: false, error: 'File not found on disk' });
    }

    res.download(resume.path, resume.originalName);
  } catch (error) {
    logger.error('Failed to download resume', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to download resume' });
  }
};
