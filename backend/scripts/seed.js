// Regenerates demo user password hashes after importing schema.sql
// Usage: node scripts/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: process.env.DB_PORT,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const hash = await bcrypt.hash('password123', 10);
  const emails = ['hod@lab.edu', 'faculty@lab.edu', 'student@lab.edu'];
  for (const email of emails) {
    await conn.execute('UPDATE users SET password_hash=? WHERE email=?', [hash, email]);
    console.log('✓ password reset for', email);
  }
  console.log('\nDemo logins (password: password123):');
  emails.forEach(e => console.log('  -', e));
  await conn.end();
})().catch(e => { console.error(e); process.exit(1); });
