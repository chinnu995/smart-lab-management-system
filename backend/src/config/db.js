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
  formattedSql = formattedSql.replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP');
  formattedSql = formattedSql.replace(/INTERVAL (\d+) DAY/gi, "INTERVAL '$1 days'");
  formattedSql = formattedSql.replace(/HOUR\(([^)]+)\)/gi, 'EXTRACT(HOUR FROM $1)');

  // Replace MySQL INSERT IGNORE with PostgreSQL ON CONFLICT DO NOTHING
  formattedSql = formattedSql.replace(/INSERT\s+IGNORE\s+INTO/gi, 'INSERT INTO');

  let trimmed = formattedSql.trim();
  const isInsert = /^INSERT\s+INTO/i.test(trimmed);
  const isUpdateOrDelete = /^(UPDATE|DELETE)/i.test(trimmed);

  if (isInsert && !/RETURNING/i.test(trimmed)) {
    trimmed = trimmed.replace(/;\s*$/, '');
    formattedSql = trimmed + ' RETURNING *';
  } else {
    formattedSql = trimmed;
  }

  return { formattedSql, finalParams, isInsert, isUpdateOrDelete };
}

async function queryWithClient(client, sql, params = []) {
  const { formattedSql, finalParams, isInsert, isUpdateOrDelete } = formatPgQuery(sql, params);
  const result = await client.query(formattedSql, finalParams);

  if (isInsert) {
    const rows = Array.isArray(result) ? (result[result.length - 1]?.rows || []) : (result?.rows || []);
    const insertedRow = rows[0] || {};
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
          otp_hash VARCHAR(255) NOT NULL,
          attempts INT DEFAULT 0,
          resend_count INT DEFAULT 0,
          expires_at TIMESTAMPTZ NOT NULL,
          last_sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS signup_otps (
          email VARCHAR(191) PRIMARY KEY,
          otp_hash VARCHAR(255) NOT NULL,
          attempts INT DEFAULT 0,
          resend_count INT DEFAULT 0,
          expires_at TIMESTAMPTZ NOT NULL,
          last_sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        ALTER TABLE signup_otps ADD COLUMN IF NOT EXISTS otp_hash VARCHAR(255);
        ALTER TABLE signup_otps ADD COLUMN IF NOT EXISTS attempts INT DEFAULT 0;
        ALTER TABLE signup_otps ADD COLUMN IF NOT EXISTS resend_count INT DEFAULT 0;
        ALTER TABLE signup_otps ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE signup_otps ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE signup_otps ALTER COLUMN otp DROP NOT NULL;

        ALTER TABLE login_otps ADD COLUMN IF NOT EXISTS otp_hash VARCHAR(255);
        ALTER TABLE login_otps ADD COLUMN IF NOT EXISTS attempts INT DEFAULT 0;
        ALTER TABLE login_otps ADD COLUMN IF NOT EXISTS resend_count INT DEFAULT 0;
        ALTER TABLE login_otps ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE login_otps ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE login_otps ALTER COLUMN otp DROP NOT NULL;

        ALTER TABLE faculty ADD COLUMN IF NOT EXISTS subject VARCHAR(100);
        ALTER TABLE faculty ADD COLUMN IF NOT EXISTS scheme VARCHAR(50);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS section VARCHAR(50);

        CREATE TABLE IF NOT EXISTS lab_sessions (
          session_id SERIAL PRIMARY KEY,
          subject VARCHAR(120) NOT NULL,
          faculty_id INT NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
          lab_id INT NOT NULL REFERENCES labs(lab_id) ON DELETE CASCADE,
          class_name VARCHAR(50) NOT NULL,
          session_date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          qr_token VARCHAR(255) NOT NULL UNIQUE,
          qr_expires_at TIMESTAMPTZ NOT NULL,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE attendance ADD COLUMN IF NOT EXISTS session_id INT REFERENCES lab_sessions(session_id) ON DELETE SET NULL;
        ALTER TABLE attendance ADD COLUMN IF NOT EXISTS subject VARCHAR(120);

        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'uniq_student_session'
          ) THEN 
            ALTER TABLE attendance ADD CONSTRAINT uniq_student_session UNIQUE (student_id, session_id);
          END IF;
        END $$;

        CREATE TABLE IF NOT EXISTS faculty_feedback (
          feedback_id SERIAL PRIMARY KEY,
          faculty_id INT NOT NULL,
          student_id INT,
          rating INT CHECK (rating >= 1 AND rating <= 5),
          comments TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO labs (lab_name, lab_code, location, capacity, status, in_charge)
        SELECT 'DSA', 'CL08', '1F 10', 40, 'available', 1
        WHERE NOT EXISTS (
          SELECT 1 FROM labs WHERE UPPER(lab_name) LIKE '%DSA%' OR UPPER(lab_name) LIKE '%DATA STRUCTURE%'
        );

        UPDATE labs SET location = '2F 01' WHERE UPPER(lab_name) LIKE '%ADA%';
        UPDATE labs SET location = '2F 02' WHERE UPPER(lab_name) LIKE '%DBMS%';
        UPDATE labs SET location = '2F 03' WHERE UPPER(lab_name) LIKE '%LATEX%';
        UPDATE labs SET location = '1F 05' WHERE UPPER(lab_name) LIKE '%MICRO%';
        UPDATE labs SET location = '1F 06' WHERE UPPER(lab_name) LIKE '%MONGO%';
        UPDATE labs SET location = '3F 28' WHERE UPPER(lab_name) LIKE '%AI%' OR UPPER(lab_name) LIKE '%PYTHON%';
        UPDATE labs SET location = 'NBGF 12' WHERE UPPER(lab_name) LIKE '%JAVA%';
        UPDATE labs SET location = '1F 09' WHERE UPPER(lab_name) LIKE '%C %' OR UPPER(lab_name) = 'C' OR UPPER(lab_name) = 'C LANGUAGE';
        UPDATE labs SET location = '1F 10' WHERE UPPER(lab_name) LIKE '%DSA%' OR UPPER(lab_name) LIKE '%DATA STRUCTURE%';

        CREATE TABLE IF NOT EXISTS schemes (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          year_label VARCHAR(50),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS subjects (
          id SERIAL PRIMARY KEY,
          scheme_id INT NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
          dept VARCHAR(120) NOT NULL,
          semester INT NOT NULL,
          code VARCHAR(50) NOT NULL,
          name VARCHAR(150) NOT NULL,
          description TEXT,
          type VARCHAR(20) DEFAULT 'lab' CHECK (type IN ('lab', 'theory', 'elective')),
          icon_key VARCHAR(50) DEFAULT 'Code2',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT uniq_scheme_dept_sem_code UNIQUE (scheme_id, dept, semester, code)
        );

        CREATE TABLE IF NOT EXISTS lab_programs (
          id SERIAL PRIMARY KEY,
          subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
          program_no INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          starter_code JSONB DEFAULT '{}'::jsonb,
          test_cases JSONB DEFAULT '[]'::jsonb,
          language VARCHAR(50) DEFAULT 'python',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT uniq_subject_program_no UNIQUE (subject_id, program_no)
        );

        CREATE TABLE IF NOT EXISTS student_subjects (
          student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
          subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (student_id, subject_id)
        );

        CREATE INDEX IF NOT EXISTS idx_subjects_scheme_dept_sem ON subjects(scheme_id, dept, semester);
        CREATE INDEX IF NOT EXISTS idx_lab_programs_subject ON lab_programs(subject_id);
        CREATE INDEX IF NOT EXISTS idx_student_subjects_student ON student_subjects(student_id);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS scheme VARCHAR(50);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS cycle VARCHAR(20);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS cycle VARCHAR(20);
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
