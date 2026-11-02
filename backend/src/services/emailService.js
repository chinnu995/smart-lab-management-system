require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Normalizes credentials and extracts user/pass from environment variables.
 */
function getEmailCredentials() {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').replace(/\s+/g, '');

  const isInvalid =
    !user ||
    user === 'your_gmail@gmail.com' ||
    user === 'your_email@gmail.com' ||
    !pass ||
    pass === 'xxxxxxxxxxxxxxxx';

  if (isInvalid) return null;
  return { user, pass };
}

/**
 * Returns the From header to use for outbound emails.
 */
function getFromAddress(user) {
  if (process.env.MAIL_FROM && !process.env.MAIL_FROM.includes('your_gmail@gmail.com')) {
    return process.env.MAIL_FROM;
  }
  if (process.env.SMTP_FROM && !process.env.SMTP_FROM.includes('your_gmail@gmail.com')) {
    return process.env.SMTP_FROM;
  }
  const senderName = process.env.SENDER_NAME || 'PESITM Smart Lab';
  return `"${senderName}" <${user}>`;
}

/**
 * Creates a Nodemailer transporter with given or default configuration.
 * Automatically handles port 465 (SSL) vs port 587/25 (STARTTLS).
 */
function createTransporter(options = {}) {
  const creds = getEmailCredentials();
  if (!creds) {
    throw new Error('SMTP credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP_USER and SMTP_PASS) in backend/.env');
  }

  const host = options.host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = options.port || parseInt(process.env.SMTP_PORT, 10) || 465;
  const secure = options.secure !== undefined
    ? options.secure
    : (process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : port === 465);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: creds,
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Sends email via SMTP with automatic retry and intelligent port fallback (465 <-> 587).
 * @param {{ to: string, subject: string, html: string, text?: string }} opts
 * @returns {Promise<{ success: boolean, provider: string, messageId: string }>}
 */
async function sendMail({ to, subject, html, text }) {
  const creds = getEmailCredentials();
  if (!creds) {
    throw new Error('Email credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP_USER and SMTP_PASS) in .env');
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const defaultPort = parseInt(process.env.SMTP_PORT, 10) || 465;
  const from = getFromAddress(creds.user);
  const cleanText = text || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  // Try primary port first, and fallback port if network/handshake fails
  const fallbackPort = defaultPort === 465 ? 587 : 465;
  const attempts = [
    { port: defaultPort, secure: defaultPort === 465, label: `Primary (${defaultPort})` },
    { port: fallbackPort, secure: fallbackPort === 465, label: `Fallback (${fallbackPort})` },
    { port: defaultPort, secure: defaultPort === 465, label: `Retry (${defaultPort})` },
  ];

  let lastErr;
  for (let i = 0; i < attempts.length; i++) {
    const { port, secure, label } = attempts[i];
    try {
      const transporter = createTransporter({ host, port, secure });
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: cleanText,
        html,
      });

      console.log(`✓ Email sent via SMTP (${host}:${port}) to ${to} [${label}, ID: ${info.messageId}]`);
      return {
        success: true,
        provider: 'smtp',
        host,
        port,
        messageId: info.messageId,
      };
    } catch (err) {
      lastErr = err;
      console.warn(`⚠️ SMTP attempt ${i + 1}/${attempts.length} [${label} ${host}:${port}] failed: ${err.message}`);

      // If credentials are strictly rejected (e.g. 535 Auth failed), switching ports won't help
      if (err.responseCode === 535 || err.message?.includes('Invalid login') || err.message?.includes('Username and Password not accepted')) {
        break;
      }

      if (i < attempts.length - 1) {
        await new Promise(res => setTimeout(res, 1000));
      }
    }
  }

  console.error(`❌ [EMAIL SERVICE ERROR] SMTP failed for ${to}: ${lastErr.message}`);
  throw new Error(`Email delivery failed: ${lastErr.message}`);
}

/**
 * Startup health check — tests credentials and verifies SMTP connectivity in background.
 */
async function verifyEmailConfig() {
  const creds = getEmailCredentials();
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;

  if (!creds) {
    console.warn(
      '⚠️  WARNING: Email credentials not configured. ' +
      'Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env — ' +
      'email verification will fail until these are set.'
    );
    return;
  }

  // Asynchronously verify connection so server startup is not blocked
  (async () => {
    try {
      const transporter = createTransporter({ host, port, secure: port === 465 });
      await transporter.verify();
      console.log(`✓ Email service ready & verified: SMTP (${host}:${port}) [${creds.user}]`);
    } catch (err) {
      // If primary port failed, test fallback port
      const fallbackPort = port === 465 ? 587 : 465;
      try {
        const fallbackTransporter = createTransporter({ host, port: fallbackPort, secure: fallbackPort === 465 });
        await fallbackTransporter.verify();
        console.log(`✓ Email service ready & verified on fallback port: SMTP (${host}:${fallbackPort}) [${creds.user}]`);
      } catch (fbErr) {
        console.warn(`⚠️  Email service SMTP verification failed: ${err.message} (Fallback port ${fallbackPort} also failed: ${fbErr.message})`);
      }
    }
  })();
}

module.exports = {
  sendMail,
  verifyEmailConfig,
  createTransporter,
  getEmailCredentials,
};
