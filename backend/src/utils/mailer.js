const nodemailer = require('nodemailer');
let transporter;
function getTransporter() {
  if (!transporter) {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return transporter;
}
exports.sendMail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('your_email@gmail.com')) {
    console.log('[MAIL DISABLED / DEFAULT USER]', to, subject); return;
  }
  return getTransporter().sendMail({ from: process.env.MAIL_FROM, to, subject, html });
};
