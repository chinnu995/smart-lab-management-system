import nodemailer from 'nodemailer';

const DEFAULT_SMTP_USER = Buffer.from('Y2hpbm1heWhlZ2RlMjUxMUBnbWFpbC5jb20=', 'base64').toString('utf8');
const DEFAULT_SMTP_PASS = Buffer.from('dXJxdXV1Z2JrYm5mdGFscQ==', 'base64').toString('utf8');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { to, subject, html, text, secret } = req.body || {};
  if (!to || !subject || !html) {
    return res.status(400).json({ message: 'Missing to, subject, or html' });
  }

  if (secret !== 'smart_lab_mail_proxy_secure_2026') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = process.env.GMAIL_USER || DEFAULT_SMTP_USER;
    const pass = (process.env.GMAIL_APP_PASSWORD || DEFAULT_SMTP_PASS || '').replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });

    const cleanText = text || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const recipients = Array.isArray(to) ? to : [to];

    const info = await transporter.sendMail({
      from: `"PESITM Smart Lab" <${user}>`,
      to: recipients.join(', '),
      subject,
      text: cleanText,
      html,
    });

    console.log(`[Vercel Mail Proxy] Email sent to ${recipients.join(', ')} [ID: ${info.messageId}]`);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('[Vercel Mail Proxy Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
