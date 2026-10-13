/**
 * Migration script: Scheme-Aware Curriculum Tables
 * Creates: schemes, subjects, lab_programs, student_subjects
 * Safe to execute multiple times (idempotent).
 */
const db = require('../src/config/db');

async function migrate() {
  console.log('🔄 Running Scheme-Aware Curriculum Migration...');
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Schemes table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS schemes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        year_label VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Subjects table
    await conn.query(`
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
    `);

    // 3. Lab programs table
    await conn.query(`
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
    `);

    // 4. Student elective subject choices
    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_subjects (
        student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
        subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (student_id, subject_id)
      );
    `);

    // 5. Indexes
    await conn.query(`
      CREATE INDEX IF NOT EXISTS idx_subjects_scheme_dept_sem ON subjects(scheme_id, dept, semester);
      CREATE INDEX IF NOT EXISTS idx_lab_programs_subject ON lab_programs(subject_id);
      CREATE INDEX IF NOT EXISTS idx_student_subjects_student ON student_subjects(student_id);
    `);

    // Ensure students table has scheme column with default
    await conn.query(`
      ALTER TABLE students ADD COLUMN IF NOT EXISTS scheme VARCHAR(50);
    `);

    await conn.commit();
    console.log('✅ Scheme-Aware Curriculum Migration completed successfully!');
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = migrate;
