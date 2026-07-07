const nodemailer = require('nodemailer');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const path = require('path');
const fs = require('fs');

// ============ NODEMAILER METHOD ============

async function sendWithNodemailer({ to, subject, body, attachmentPath, attachmentName, credentials }) {
  if (!credentials || !credentials.email || !credentials.appPassword) {
    throw new Error('Gmail credentials not configured. Please set them in Settings.');
  }

  try {
    logger.info('Sending email via Nodemailer', { to, subject });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: credentials.email,
        pass: credentials.appPassword,
      },
    });

    const mailOptions = {
      from: credentials.email,
      to,
      subject,
      text: body,
    };

    // Attach resume if provided
    if (attachmentPath && fs.existsSync(attachmentPath)) {
      mailOptions.attachments = [
        {
          filename: attachmentName || path.basename(attachmentPath),
          path: attachmentPath,
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent via Nodemailer', { messageId: info.messageId });

    // Also save a copy to Gmail Sent folder via IMAP
    try {
      await saveToGmailSent({ mailOptions, credentials });
    } catch (imapErr) {
      // Non-fatal — email was already sent, just couldn't copy to Sent
      logger.warn('Could not save to Gmail Sent folder', { error: imapErr.message });
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Nodemailer send failed', { error: error.message });
    throw error;
  }
}

// Save a copy to Gmail Sent folder via IMAP APPEND
async function saveToGmailSent({ mailOptions, credentials }) {
  const net = require('net');
  const tls = require('tls');

  return new Promise((resolve, reject) => {
    // Build RFC 2822 raw email
    const boundary = `----=_Part_${Date.now()}`;
    const hasAttachment = mailOptions.attachments && mailOptions.attachments.length > 0;
    let rawEmail;

    if (hasAttachment) {
      const att = mailOptions.attachments[0];
      const fileData = fs.readFileSync(att.path).toString('base64');
      rawEmail = [
        `From: ${mailOptions.from}`,
        `To: ${mailOptions.to}`,
        `Subject: ${mailOptions.subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        ``,
        `--${boundary}`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        mailOptions.text,
        ``,
        `--${boundary}`,
        `Content-Type: application/octet-stream`,
        `Content-Transfer-Encoding: base64`,
        `Content-Disposition: attachment; filename="${att.filename}"`,
        ``,
        fileData,
        `--${boundary}--`,
      ].join('\r\n');
    } else {
      rawEmail = [
        `From: ${mailOptions.from}`,
        `To: ${mailOptions.to}`,
        `Subject: ${mailOptions.subject}`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        mailOptions.text,
      ].join('\r\n');
    }

    const emailBuffer = Buffer.from(rawEmail);

    let socket;
    let data = '';
    let step = 0;

    const send = (cmd) => {
      socket.write(cmd + '\r\n');
    };

    const onData = (chunk) => {
      data += chunk.toString();
      if (!data.includes('\r\n')) return;

      const line = data.split('\r\n').filter(Boolean).pop();
      data = '';

      if (step === 0 && line.startsWith('* OK')) {
        step++;
        send(`A1 LOGIN "${credentials.email}" "${credentials.appPassword}"`);
      } else if (step === 1 && line.includes('A1 OK')) {
        step++;
        send(`A2 APPEND "[Gmail]/Sent Mail" (\\Seen) {${emailBuffer.length}}`);
      } else if (step === 2 && line.startsWith('+')) {
        step++;
        socket.write(emailBuffer);
        socket.write('\r\n');
      } else if (step === 3 && line.includes('A2 OK')) {
        step++;
        send('A3 LOGOUT');
      } else if (step === 4) {
        socket.destroy();
        resolve();
      } else if (line.includes('NO') || line.includes('BAD')) {
        socket.destroy();
        reject(new Error('IMAP error: ' + line));
      }
    };

    socket = tls.connect({ host: 'imap.gmail.com', port: 993 }, () => {
      socket.on('data', onData);
    });

    socket.on('error', reject);
    socket.setTimeout(15000, () => {
      socket.destroy();
      reject(new Error('IMAP timeout'));
    });
  });
}

// ============ PLAYWRIGHT GMAIL METHOD ============
// NOTE: This method is not supported because Google App Passwords only
// work with SMTP/IMAP — not with browser-based login.
// Use Nodemailer (SMTP) instead.
async function sendWithPlaywright({ to, subject, body, attachmentPath, credentials }) {
  throw new Error(
    'Browser-based sending is not supported. Google App Passwords cannot be used to log into Gmail via a browser. Please use the Nodemailer (SMTP) method instead.'
  );
}

module.exports = {
  sendWithNodemailer,
  sendWithPlaywright,
};
