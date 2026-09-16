const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase SDK client
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY && !process.env.SUPABASE_URL.includes('your-project')) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

// Build pg Pool connection config
const connectionString = process.env.DATABASE_URL;
let poolConfig = {};

if (connectionString && !connectionString.includes('localhost:5432') && !connectionString.includes('YOUR-PASSWORD')) {
  poolConfig = {
    connectionString,
    ssl: { rejectUnauthorized: false },
  };
} else if (process.env.DB_HOST && process.env.DB_USER) {
  poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
} else {
  // Fallback default
  poolConfig = {
    connectionString: connectionString || 'postgres://postgres:postgres@localhost:5432/postgres',
  };
}

const pool = new Pool(poolConfig);

/**
 * Converts MySQL query syntax to PostgreSQL syntax:
 * 1. Replaces '?' placeholders with '$1', '$2', ...
 * 2. Expands 2D bulk INSERT array placeholders (VALUES ?) into ($1, $2), ($3, $4)
 * 3. Replaces CURDATE() with CURRENT_DATE
 * 4. Appends RETURNING * to INSERT statements if not present
 */
function formatPgQuery(sql, params = []) {
  let finalParams = [];
  let paramIndex = 1;
  let formattedSql = sql;

  // Check for 2D array bulk INSERT (e.g. VALUES ?)
  const isBulkInsert = /VALUES\s*\?/i.test(formattedSql) && params.length === 1 && Array.isArray(params[0]) && Array.isArray(params[0][0]);

  if (isBulkInsert) {
    const rows = params[0];
    const placeholders = rows.map((row) => {
      const rowPlaceholders = row.map(() => `$${paramIndex++}`);
      finalParams.push(...row);
      return `(${rowPlaceholders.join(', ')})`;
    });
    formattedSql = formattedSql.replace(/VALUES\s*\?/i, `VALUES ${placeholders.join(', ')}`);
  } else {
    finalParams = [...params];
    formattedSql = formattedSql.replace(/\?/g, () => `$${paramIndex++}`);
  }

  // Replace MySQL specific date/time functions
  formattedSql = formattedSql.replace(/CURDATE\(\)/gi, 'CURRENT_DATE');
  formattedSql = formattedSql.replace(/INTERVAL (\d+) DAY/gi, "INTERVAL '$1 days'");
  formattedSql = formattedSql.replace(/HOUR\(([^)]+)\)/gi, 'EXTRACT(HOUR FROM $1)');

  const trimmed = formattedSql.trim();
  const isInsert = /^INSERT\s+INTO/i.test(trimmed);
  const isUpdateOrDelete = /^(UPDATE|DELETE)/i.test(trimmed);

  if (isInsert && !/RETURNING/i.test(trimmed)) {
    formattedSql += ' RETURNING *';
  }

  return { formattedSql, finalParams, isInsert, isUpdateOrDelete };
}

async function queryWithClient(client, sql, params = []) {
  const { formattedSql, finalParams, isInsert, isUpdateOrDelete } = formatPgQuery(sql, params);
  const result = await client.query(formattedSql, finalParams);

  if (isInsert) {
    const insertedRow = result.rows[0] || {};
    const insertId =
      insertedRow.id ||
      insertedRow.user_id ||
      insertedRow.student_id ||
      insertedRow.faculty_id ||
      insertedRow.lab_id ||
      insertedRow.equipment_id ||
      insertedRow.booking_id ||
      insertedRow.attendance_id ||
      insertedRow.complaint_id ||
      insertedRow.announcement_id ||
      insertedRow.notif_id ||
      insertedRow.test_id ||
      insertedRow.question_id ||
      insertedRow.submission_id ||
      insertedRow.exp_id ||
      insertedRow.chat_id ||
      Object.values(insertedRow)[0] ||
      0;

    const resHeader = {
      insertId,
      affectedRows: result.rowCount,
      rowCount: result.rowCount,
      rows: result.rows,
    };
    return [resHeader, result.fields];
  }

  if (isUpdateOrDelete) {
    const resHeader = {
      affectedRows: result.rowCount,
      rowCount: result.rowCount,
      rows: result.rows,
    };
    return [resHeader, result.fields];
  }

  return [result.rows, result.fields];
}

/**
 * Database query wrapper compatible with mysql2 [rows, fields] destructuring
 */
async function query(sql, params = []) {
  return queryWithClient(pool, sql, params);
}

async function getConnection() {
  const client = await pool.connect();
  return {
    query: (sql, params = []) => queryWithClient(client, sql, params),
    execute: (sql, params = []) => queryWithClient(client, sql, params),
    beginTransaction: () => client.query('BEGIN'),
    commit: () => client.query('COMMIT'),
    rollback: () => client.query('ROLLBACK'),
    release: () => client.release(),
  };
}

async function verifyConnectionWithRetry({ maxAttempts = 5, initialDelayMs = 2000 } = {}) {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxAttempts) {
    try {
      const client = await pool.connect();
      console.log('✓ Supabase / PostgreSQL connected');
      await client.query(`
        CREATE TABLE IF NOT EXISTS login_otps (
          email VARCHAR(191) PRIMARY KEY,
          otp VARCHAR(6) NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL
        );
        CREATE TABLE IF NOT EXISTS signup_otps (
          email VARCHAR(191) PRIMARY KEY,
          otp VARCHAR(6) NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL
        );
        ALTER TABLE faculty ADD COLUMN IF NOT EXISTS subject VARCHAR(100);
        ALTER TABLE faculty ADD COLUMN IF NOT EXISTS scheme VARCHAR(50);
        CREATE TABLE IF NOT EXISTS faculty_feedback (
          feedback_id SERIAL PRIMARY KEY,
          faculty_id INT NOT NULL,
          student_id INT,
          rating INT CHECK (rating >= 1 AND rating <= 5),
          comments TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO labs (lab_name, lab_code, location, capacity, status, in_charge)
        SELECT 'DSA', 'CL08', 'Block B - 110', 40, 'available', 1
        WHERE NOT EXISTS (
          SELECT 1 FROM labs WHERE UPPER(lab_name) LIKE '%DSA%' OR UPPER(lab_name) LIKE '%DATA STRUCTURE%'
        );
      `);
      client.release();
      return;
    } catch (e) {
      attempt += 1;
      console.error(`PostgreSQL connection attempt ${attempt} failed:`, e && e.message ? e.message : e);
      if (attempt >= maxAttempts) break;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
      delay = Math.min(delay * 2, 30000);
    }
  }

  console.error(`✗ PostgreSQL error: failed to connect after ${maxAttempts} attempts`);
}

verifyConnectionWithRetry({ maxAttempts: 5, initialDelayMs: 2000 }).catch((e) => {
  console.error('Unexpected error while verifying PostgreSQL connection:', e);
});

module.exports = {
  query,
  execute: query,
  getConnection,
  pool,
  supabase,
};
