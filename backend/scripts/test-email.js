#!/usr/bin/env node
/**
 * test-email.js — PESITM Smart Lab email delivery test
 *
 * Usage:
 *   node scripts/test-email.js you@example.com
 */

require('dotenv').config();
const { sendMail, isEmailConfigured } = require('../src/services/emailService');

const recipient = process.argv[2];
if (!recipient || !recipient.includes('@')) {
  console.error('\n  Usage: node scripts/test-email.js you@example.com\n');
  process.exit(1);
}

const SUBJECT = 'PESITM Smart Lab — Email Test';
const HTML = `
<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 480px;">
  <h2 style="color: #2563eb;">PESITM Smart Lab — Email Test</h2>
  <p>This is a diagnostic test email sent at <strong>${new Date().toISOString()}</strong>.</p>
  <p style="color: #64748b; font-size: 13px;">If you received this, your email configuration is working correctly. ✓</p>
</div>`;
const TEXT = `PESITM Smart Lab — Email Test\nSent at: ${new Date().toISOString()}\nIf you received this, email is working correctly.`;

async function run() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  PESITM Smart Lab — Email Delivery Test');
  console.log('══════════════════════════════════════════════');
  console.log(`  Recipient : ${recipient}`);
  console.log(`  Timestamp : ${new Date().toISOString()}`);
  console.log('──────────────────────────────────────────────\n');

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || 'PESITM Smart Lab <onboarding@resend.dev>';
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  console.log('📋 Configuration:');
  if (resendApiKey) {
    const maskedKey = resendApiKey.substring(0, 7) + '...' + resendApiKey.substring(resendApiKey.length - 4);
    console.log(`   Provider            : Resend SDK (Primary)`);
    console.log(`   RESEND_API_KEY      : ${maskedKey}`);
    console.log(`   RESEND_FROM         : ${resendFrom}`);
  } else {
    console.log(`   RESEND_API_KEY      : ✗ NOT SET`);
  }

  if (user && pass) {
    console.log(`   SMTP Fallback       : Enabled (${user})`);
  } else {
    console.log(`   SMTP Fallback       : Not configured`);
  }
  console.log('');

  if (!isEmailConfigured()) {
    console.error('❌ Cannot send — credentials missing. Add to backend/.env:\n');
    console.error('   RESEND_API_KEY=re_your_api_key\n');
    process.exit(1);
  }

  console.log(`📤 Sending test email to ${recipient}...`);
  try {
    const result = await sendMail({ to: recipient, subject: SUBJECT, html: HTML, text: TEXT });
    console.log(`\n✅ SUCCESS`);
    console.log(`   Provider   : ${result.provider.toUpperCase()}`);
    console.log(`   Message ID : ${result.messageId}`);
    console.log('\n→ Check your inbox (and Spam/Junk folder) for the test email.\n');
  } catch (err) {
    console.error(`\n❌ FAILED: ${err.message}\n`);

    if (err.message?.includes('only send testing emails to your own email address') || err.message?.includes('validation_error')) {
      console.error('Notice: On the Resend free tier without a verified custom domain, emails can only be sent');
      console.error('to the email address associated with your Resend account, or you can verify a custom domain at:');
      console.error('  → https://resend.com/domains\n');
    } else if (err.message?.includes('Invalid login') || err.message?.includes('Username and Password') || err.responseCode === 535) {
      console.error('Fix: Invalid SMTP credentials.');
    }
    process.exit(1);
  }
}

run();
