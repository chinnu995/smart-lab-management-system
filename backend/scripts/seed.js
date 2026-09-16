// Regenerates demo user password hashes after importing schema.sql / supabase_schema.sql
// Usage: node scripts/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

(async () => {
  const hash = await bcrypt.hash('password123', 10);
  await db.query('UPDATE users SET password_hash = ?', [hash]);
  const [users] = await db.query('SELECT email, role, full_name FROM users');
  console.log('✓ Password reset to password123 for all users:');
  users.forEach((u) => console.log(`  - [${u.role ? u.role.toUpperCase() : 'USER'}] ${u.email} (${u.full_name})`));
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
