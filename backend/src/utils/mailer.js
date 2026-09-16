const nodemailer = require('nodemailer');

function createTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_PASS || '').replace(/\s+/g, '');
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465;

  if (host.includes('gmail') || (user && user.includes('gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
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
    console.log('------------------------------------------------------');
    console.log('NOTICE: Real Gmail SMTP delivery requires your Gmail address & App Password');
    console.log('in backend/.env (SMTP_USER and SMTP_PASS).');
    console.log('======================================================\n');
    return true;
  }

  const transporter = createTransporter();
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || `"Smart Lab" <${user}>`,
      to,
      subject,
      html
    });
    console.log(`✓ Email delivered successfully to ${to} (MessageId: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`❌ SMTP Email Delivery Failed to ${to}:`, err.message);
    throw err;
  }
};
