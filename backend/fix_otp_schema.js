require('dotenv').config();
const db = require('./src/config/db');

async function fixSchema() {
  const fixes = [
    `ALTER TABLE signup_otps ALTER COLUMN otp DROP NOT NULL`,
    `ALTER TABLE login_otps ALTER COLUMN otp DROP NOT NULL`,
    `ALTER TABLE signup_otps ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE login_otps ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE signup_otps ADD COLUMN IF NOT EXISTS otp_hash VARCHAR(255)`,
    `ALTER TABLE login_otps ADD COLUMN IF NOT EXISTS otp_hash VARCHAR(255)`,
    `ALTER TABLE signup_otps ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE login_otps ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`,
  ];

  for (const sql of fixes) {
    try {
      await db.execute(sql);
      console.log('✅', sql.slice(0, 70));
    } catch (e) {
      if (e.message?.includes('does not exist') || e.message?.includes('already exists')) {
        console.log('⏭ skipped (already ok):', sql.slice(0, 70));
      } else {
        console.error('❌', sql.slice(0, 70), '->', e.message);
      }
    }
  }
  console.log('\nAll done!');
  process.exit(0);
}

fixSchema();
