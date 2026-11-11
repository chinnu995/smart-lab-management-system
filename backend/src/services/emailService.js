require('dotenv').config();
const { Resend } = require('resend');
const nodemailer = require('nodemailer');

/**
 * Returns a configured Resend client instance if RESEND_API_KEY is present and valid.
 */
function getResendClient() {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey || apiKey === 'your_resend_api_key' || apiKey === 're_xxxxxxxxxxxx') {
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Normalizes credentials and extracts user/pass from SMTP environment variables.
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
function getFromAddress(provider = 'resend', smtpUser = null) {
  const senderName = process.env.SENDER_NAME || 'PESITM Smart Lab';

  if (process.env.RESEND_FROM && !process.env.RESEND_FROM.includes('your_')) {
    return process.env.RESEND_FROM;
  }
  if (process.env.MAIL_FROM && !process.env.MAIL_FROM.includes('your_gmail@gmail.com') && !process.env.MAIL_FROM.includes('your_')) {
    return process.env.MAIL_FROM;
  }
  if (provider === 'resend') {
    return `"${senderName}" <onboarding@resend.dev>`;
  }
  if (process.env.SMTP_FROM && !process.env.SMTP_FROM.includes('your_gmail@gmail.com')) {
    return process.env.SMTP_FROM;
  }
  return smtpUser ? `"${senderName}" <${smtpUser}>` : `"${senderName}" <onboarding@resend.dev>`;
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
 * Sends email via Nodemailer SMTP with automatic retry and intelligent port fallback (465 <-> 587).
 */
async function sendViaSmtp({ to, subject, html, text, creds }) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const defaultPort = parseInt(process.env.SMTP_PORT, 10) || 465;
  const from = getFromAddress('smtp', creds.user);
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
        id: info.messageId,
      };
    } catch (err) {
      lastErr = err;
      console.warn(`⚠️ SMTP attempt ${i + 1}/${attempts.length} [${label} ${host}:${port}] failed: ${err.message}`);

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
 * Sends email via Resend SDK (primary) with fallback to SMTP if Resend fails or is unconfigured.
 * @param {{ to: string | string[], subject: string, html: string, text?: string }} opts
 * @returns {Promise<{ success: boolean, provider: string, messageId: string, id: string }>}
 */
async function sendMail({ to, subject, html, text }) {
  const cleanText = text || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const resend = getResendClient();
  const smtpCreds = getEmailCredentials();

  // 1. Resend SDK (Primary)
  if (resend) {
    const from = getFromAddress('resend');
    const recipient = Array.isArray(to) ? to : [to];

    try {
      const response = await resend.emails.send({
        from,
        to: recipient,
        subject,
        html,
        text: cleanText,
      });

      if (response.error) {
        throw new Error(response.error.message || JSON.stringify(response.error));
      }

      const messageId = response.data?.id;
      console.log(`✓ Email sent via Resend SDK to ${recipient.join(', ')} [ID: ${messageId}]`);
      return {
        success: true,
        provider: 'resend',
        messageId,
        id: messageId,
      };
    } catch (resendErr) {
      console.warn(`⚠️ Resend SDK send failed: ${resendErr.message}`);
      if (!smtpCreds) {
        console.error(`❌ [EMAIL SERVICE ERROR] Resend failed for ${to}: ${resendErr.message}`);
        throw new Error(`Email delivery failed: ${resendErr.message}`);
      }
      console.log(`ℹ️ Falling back to SMTP for ${to}...`);
    }
  }

  // 2. SMTP Fallback
  if (smtpCreds) {
    return await sendViaSmtp({ to, subject, html, text: cleanText, creds: smtpCreds });
  }

  throw new Error('Email credentials not configured. Please set RESEND_API_KEY in backend/.env');
}

/**
 * Checks whether any email service is configured.
 */
function isEmailConfigured() {
  return Boolean(getResendClient() || getEmailCredentials());
}

/**
 * Startup health check — verifies Resend or SMTP connectivity in background.
 */
async function verifyEmailConfig() {
  const resend = getResendClient();
  const smtpCreds = getEmailCredentials();

  if (!resend && !smtpCreds) {
    console.warn(
      '⚠️  WARNING: Email credentials not configured. ' +
      'Set RESEND_API_KEY (or GMAIL_USER and GMAIL_APP_PASSWORD) in backend/.env — ' +
      'email verification will fail until these are set.'
    );
    return;
  }

  // Resend Verification
  if (resend) {
    (async () => {
      try {
        const domains = await resend.domains.list();
        if (domains.error) {
          console.warn(`⚠️  Resend API verification notice: ${domains.error.message}`);
        } else {
          console.log(`✓ Email service ready & verified: Resend SDK`);
        }
      } catch (err) {
        console.warn(`⚠️  Resend verification failed: ${err.message}`);
      }
    })();
    return;
  }

  // SMTP Verification
  if (smtpCreds) {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT, 10) || 465;

    (async () => {
      try {
        const transporter = createTransporter({ host, port, secure: port === 465 });
        await transporter.verify();
        console.log(`✓ Email service ready & verified: SMTP (${host}:${port}) [${smtpCreds.user}]`);
      } catch (err) {
        const fallbackPort = port === 465 ? 587 : 465;
        try {
          const fallbackTransporter = createTransporter({ host, port: fallbackPort, secure: fallbackPort === 465 });
          await fallbackTransporter.verify();
          console.log(`✓ Email service ready & verified on fallback port: SMTP (${host}:${fallbackPort}) [${smtpCreds.user}]`);
        } catch (fbErr) {
          console.warn(`⚠️  Email service SMTP verification failed: ${err.message} (Fallback port ${fallbackPort} also failed: ${fbErr.message})`);
        }
      }
    })();
  }
}

module.exports = {
  sendMail,
  verifyEmailConfig,
  createTransporter,
  getEmailCredentials,
  getResendClient,
  isEmailConfigured,
  getFromAddress,
};
