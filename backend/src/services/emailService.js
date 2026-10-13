require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter using Gmail SMTP on port 465 (SSL).
 * Reads GMAIL_USER / GMAIL_APP_PASSWORD first; falls back to SMTP_USER / SMTP_PASS.
 */
function createGmailTransporter() {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').replace(/\s+/g, '');

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL — works even where port 587 is blocked
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
  });
}

/**
 * Sends email via Gmail SMTP port 465 with up to 2 retries.
 * @param {{ to: string, subject: string, html: string, text?: string }} opts
 * @returns {Promise<{ success: boolean, provider: string, messageId: string }>}
 */
async function sendMail({ to, subject, html, text }) {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (!user || user === 'your_gmail@gmail.com' || !pass || pass.replace(/\s+/g, '') === 'xxxxxxxxxxxxxxxx') {
    throw new Error('Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
  }

  const senderName = process.env.SENDER_NAME || 'PESITM Smart Lab';
  const cleanText = text || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const transporter = createGmailTransporter();

  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: `"${senderName}" <${user}>`,
        to,
        subject,
        text: cleanText,
        html,
      });
      console.log(`✓ Email sent via Gmail SMTP to ${to} (Attempt ${attempt}, ID: ${info.messageId})`);
      return { success: true, provider: 'gmail-smtp', messageId: info.messageId };
    } catch (err) {
      lastErr = err;
      console.warn(`⚠️ Gmail SMTP attempt ${attempt}/2 failed: ${err.message}`);
      if (attempt < 2) await new Promise(res => setTimeout(res, 1200));
    }
  }

  console.error(`❌ [EMAIL SERVICE ERROR] Gmail SMTP failed for ${to}: ${lastErr.message}`);
  throw new Error('Email service unavailable. Please check your network or try again in a few moments.');
}

/**
 * Startup health check — call once after server starts.
 * Logs "Email service ready" or the exact failure reason.
 */
async function verifyEmailConfig() {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  const ready =
    user &&
    user !== 'your_gmail@gmail.com' &&
    pass &&
    pass.replace(/\s+/g, '') !== 'xxxxxxxxxxxxxxxx';

  if (ready) {
    console.log(`✓ Email service ready: Gmail SMTP (${user}) port 465 SSL`);
  } else {
    console.warn(
      '⚠️  WARNING: Email credentials not configured. ' +
      'Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env — ' +
      'email verification will fail until these are set.'
    );
  }
}

module.exports = { sendMail, verifyEmailConfig };
