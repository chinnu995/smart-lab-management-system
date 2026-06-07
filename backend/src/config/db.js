const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

async function verifyConnectionWithRetry({ maxAttempts = 10, initialDelayMs = 2000 } = {}) {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxAttempts) {
    try {
      const c = await pool.getConnection();
      console.log('✓ MySQL connected');
      await c.query(`
        CREATE TABLE IF NOT EXISTS login_otps (
          email VARCHAR(191) PRIMARY KEY,
          otp VARCHAR(6) NOT NULL,
          expires_at DATETIME NOT NULL
        ) ENGINE=InnoDB;
      `);
      c.release();
      return;
    } catch (e) {
      attempt += 1;
      console.error(`MySQL connection attempt ${attempt} failed:`, e && e.message ? e.message : e);
      if (e && e.stack) console.error(e.stack);
      if (attempt >= maxAttempts) break;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
      delay = Math.min(delay * 2, 30000);
    }
  }

  console.error(`✗ MySQL error: failed to connect after ${maxAttempts} attempts`);
}

// Try to verify connection in background; do not block module export.
verifyConnectionWithRetry({ maxAttempts: 12, initialDelayMs: 2000 }).catch((e) => {
  console.error('Unexpected error while verifying MySQL connection:', e);
});

module.exports = pool;
