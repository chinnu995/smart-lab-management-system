const nodemailer = require('nodemailer');

function createTransporter(attempt = 1) {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_PASS || '').replace(/\s+/g, '');
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;

  if (attempt === 1) {
    // Attempt 1: Direct Gmail Service
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000
    });
  } else if (attempt === 2) {
    // Attempt 2: Port 465 SSL Direct
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000
    });
  } else {
    // Attempt 3: Custom Host & Port
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000
    });
  }
}

exports.sendMail = async ({ to, subject, html }) => {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  if (!user || user === 'your_email@gmail.com' || !pass || pass === 'your_app_password') {
    console.log('\n======================================================');
    console.log('[SMTP CONFIGURATION NOTICE]');
    console.log(`Target Recipient: ${to}`);
    console.log(`Subject:          ${subject}`);
    console.log('------------------------------------------------------');
    const cleanText = html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    console.log(`Content:          ${cleanText}`);
    console.log('======================================================\n');
    return true;
  }

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const transporter = createTransporter(attempt);
      const info = await transporter.sendMail({
        from: process.env.MAIL_FROM || `"Smart Lab" <${user}>`,
        to,
        subject,
        html
      });
      console.log(`✓ Email delivered successfully to ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ SMTP Attempt ${attempt} failed to ${to}: ${err.message}. Retrying fallback transporter...`);
    }
  }

  console.error(`❌ SMTP Email Delivery Failed to ${to}:`, lastError?.message);
  throw lastError;
};
