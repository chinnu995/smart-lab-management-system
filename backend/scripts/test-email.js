#!/usr/bin/env node
/**
 * test-email.js — PESITM Smart Lab email delivery test
 *
 * Usage:
 *   node scripts/test-email.js you@example.com
 */

require('dotenv').config();
const { sendMail } = require('../src/services/emailService');

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
  <p style="color: #64748b; font-size: 13px;">If you received this, Gmail SMTP is working correctly. ✓</p>
</div>`;
const TEXT = `PESITM Smart Lab — Email Test\nSent at: ${new Date().toISOString()}\nIf you received this, Gmail SMTP is working correctly.`;

async function run() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  PESITM Smart Lab — Email Delivery Test');
  console.log('══════════════════════════════════════════════');
  console.log(`  Recipient : ${recipient}`);
  console.log(`  Timestamp : ${new Date().toISOString()}`);
  console.log('──────────────────────────────────────────────\n');

  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT || '465';

  console.log('📋 Configuration:');
  console.log(`   SMTP_HOST           : ${host}`);
  console.log(`   SMTP_PORT           : ${port}`);
  console.log(`   SMTP_USER           : ${user || '✗ NOT SET'}`);
  console.log(`   SMTP_PASS           : ${pass ? (pass.replace(/\s+/g, '') === 'xxxxxxxxxxxxxxxx' ? '✗ placeholder — set a real App Password' : '✓ set') : '✗ NOT SET'}`);
  console.log('');

  if (!user || !pass) {
    console.error('❌ Cannot send — credentials missing. Add to backend/.env:\n');
    console.error('   GMAIL_USER=your@gmail.com');
    console.error('   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx\n');
    console.error('Setup steps:');
    console.error('  1. Enable 2-Step Verification → https://myaccount.google.com/security');
    console.error('  2. Create App Password       → https://myaccount.google.com/apppasswords\n');
    process.exit(1);
  }

  console.log(`📤 Sending test email via SMTP (${host}:${port} with auto-fallback) ...`);
  try {
    const result = await sendMail({ to: recipient, subject: SUBJECT, html: HTML, text: TEXT });
    console.log(`\n✅ SUCCESS`);
    console.log(`   Provider   : ${result.provider}`);
    console.log(`   Message ID : ${result.messageId}`);
    console.log('\n→ Check your inbox (and Spam/Junk folder) for the test email.\n');
  } catch (err) {
    console.error(`\n❌ FAILED: ${err.message}\n`);

    if (err.message?.includes('Invalid login') || err.message?.includes('Username and Password') || err.responseCode === 535) {
      console.error('Fix: Invalid email credentials. For Gmail, you must use a 16-character App Password, NOT your regular password.');
      console.error('  1. Enable 2-Step Verification → https://myaccount.google.com/security');
      console.error('  2. Create App Password       → https://myaccount.google.com/apppasswords');
    } else if (err.message?.includes('ECONNREFUSED') || err.message?.includes('ETIMEDOUT') || err.message?.includes('network')) {
      console.error(`Fix: Cannot connect to ${host}:${port}. Your network may block outbound SMTP traffic.`);
      console.error('  → Try setting SMTP_PORT=587 (or SMTP_PORT=465) in backend/.env.');
      console.error('  → If on mobile hotspot or restricted WiFi, check firewall settings.');
    } else if (err.message?.includes('not configured')) {
      console.error('Fix: Set GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP_USER and SMTP_PASS) in backend/.env');
    }
    process.exit(1);
  }
}

run();
