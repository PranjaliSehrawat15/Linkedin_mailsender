const { getDb } = require('../database/db');
const gmailService = require('../services/gmail/gmailService');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// Send email to a recruiter
exports.sendEmail = async (req, res) => {
  try {
    const { recruiterId, subject, body, resumeId, method = 'nodemailer' } = req.body;

    if (!recruiterId || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'recruiterId, subject, and body are required',
      });
    }

    const db = getDb();

    // Get recruiter
    const recruiter = db.prepare('SELECT * FROM recruiters WHERE id = ?').get(recruiterId);
    if (!recruiter) {
      return res.status(404).json({ success: false, error: 'Recruiter not found' });
    }

    if (!recruiter.email) {
      return res.status(400).json({
        success: false,
        error: 'Recruiter does not have an email address',
      });
    }

    // Get resume if provided
    let resumePath = null;
    let resumeName = null;
    if (resumeId) {
      const resume = db.prepare('SELECT * FROM resumes WHERE id = ?').get(resumeId);
      if (resume && fs.existsSync(resume.path)) {
        resumePath = resume.path;
        resumeName = resume.originalName;
      }
    }

    // Get credentials
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    if (!settings || !settings.gmailEmail || !settings.gmailAppPassword) {
      return res.status(400).json({ success: false, error: 'Gmail credentials are not configured. Please set them in the Settings page.' });
    }

    // Record email in DB
    const emailStmt = db.prepare(
      'INSERT INTO emails (recruiterId, subject, body, resumeId, status) VALUES (?, ?, ?, ?, ?)'
    );
    const emailResult = emailStmt.run(recruiterId, subject, body, resumeId || null, 'sending');
    const emailId = emailResult.lastInsertRowid;

    // Send the email
    try {
      if (method === 'nodemailer') {
        await gmailService.sendWithNodemailer({
          to: recruiter.email,
          subject,
          body,
          attachmentPath: resumePath,
          attachmentName: resumeName,
          credentials: {
            email: settings.gmailEmail,
            appPassword: settings.gmailAppPassword
          }
        });
      } else {
        await gmailService.sendWithPlaywright({
          to: recruiter.email,
          subject,
          body,
          attachmentPath: resumePath,
          credentials: {
            email: settings.gmailEmail,
            appPassword: settings.gmailAppPassword
          }
        });
      }

      // Update email status
      db.prepare('UPDATE emails SET status = ?, sentAt = CURRENT_TIMESTAMP WHERE id = ?').run(
        'sent',
        emailId
      );

      // Update recruiter status
      db.prepare("UPDATE recruiters SET status = 'contacted' WHERE id = ?").run(recruiterId);

      // Update search emailsSent count
      if (recruiter.searchId) {
        db.prepare(
          'UPDATE searches SET emailsSent = emailsSent + 1 WHERE id = ?'
        ).run(recruiter.searchId);
      }

      logger.info('Email sent', { emailId, to: recruiter.email, method });
      res.json({ success: true, message: 'Email sent successfully', data: { emailId } });
    } catch (sendError) {
      db.prepare('UPDATE emails SET status = ? WHERE id = ?').run('failed', emailId);
      logger.error('Email sending failed', { error: sendError.message });
      res.status(500).json({ success: false, error: 'Failed to send email: ' + sendError.message });
    }
  } catch (error) {
    logger.error('Email controller error', { error: error.message });
    res.status(500).json({ success: false, error: 'Email operation failed' });
  }
};

// Get default email template
exports.getTemplate = (req, res) => {
  res.json({
    success: true,
    data: {
      subject: 'Application for {Position} Role',
      body: `Hello,

I came across your LinkedIn post regarding the opening for the {Position} role.

I am interested in applying for this opportunity.

Please find my resume attached.

Looking forward to hearing from you.

Thank You.

Regards,
{Name}`,
    },
  });
};
