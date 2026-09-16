const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '',
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.sendMail({
  from: process.env.MAIL_FROM,
  to: 'chinmayhegde2511@gmail.com',
  subject: 'Test Email from Smart Lab',
  html: '<p>Testing SMTP configuration.</p>'
})
.then(info => {
  console.log('Email sent successfully:', info.messageId);
})
.catch(err => {
  console.error('Email sending failed:', err);
});
