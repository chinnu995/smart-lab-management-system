/**
 * Reversible Migration Script for VTU Scheme-Aware Curriculum
 * Usage:
 *   node scripts/migrate_vtu_curriculum.js up
 *   node scripts/migrate_vtu_curriculum.js down
 */
const db = require('../src/config/db');

async function up() {
  console.log('🔄 Running Migration: VTU Scheme-Aware Curriculum (UP)...');
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Schemes table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS schemes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure 2022 and 2025 exist as required by spec
    await conn.query(`
      INSERT INTO schemes (name) VALUES ('2022') ON CONFLICT (name) DO NOTHING;
      INSERT INTO schemes (name) VALUES ('2025') ON CONFLICT (name) DO NOTHING;
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
        type VARCHAR(20) DEFAULT 'lab',
        description TEXT,
        icon_key VARCHAR(50) DEFAULT 'Code2',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uniq_scheme_dept_sem_code UNIQUE (scheme_id, dept, semester, code)
      );
    `);

    // Update CHECK constraint on subjects.type to ('lab','elective','activity','theory')
    await conn.query(`
      DO $$
      BEGIN
        ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_type_check;
        ALTER TABLE subjects ADD CONSTRAINT subjects_type_check 
          CHECK (type IN ('lab', 'elective', 'activity', 'theory'));
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END $$;
    `);

    // 3. Lab Programs table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lab_programs (
        id SERIAL PRIMARY KEY,
        subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        program_no INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        source TEXT,
        runnable BOOLEAN DEFAULT TRUE,
        test_cases JSONB NULL,
        starter_code TEXT NULL,
        language TEXT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uniq_subject_program_no UNIQUE (subject_id, program_no)
      );
    `);

    // Ensure columns exist on lab_programs
    await conn.query(`ALTER TABLE lab_programs ADD COLUMN IF NOT EXISTS source TEXT;`);
    await conn.query(`ALTER TABLE lab_programs ADD COLUMN IF NOT EXISTS runnable BOOLEAN DEFAULT TRUE;`);
    await conn.query(`ALTER TABLE lab_programs ADD COLUMN IF NOT EXISTS starter_code TEXT;`);
    await conn.query(`ALTER TABLE lab_programs ADD COLUMN IF NOT EXISTS language TEXT;`);
    await conn.query(`ALTER TABLE lab_programs ADD COLUMN IF NOT EXISTS test_cases JSONB;`);

    // 4. Student Subjects table (for elective choices only)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_subjects (
        id SERIAL PRIMARY KEY,
        student_id INT NOT NULL,
        subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uniq_student_subject UNIQUE (student_id, subject_id)
      );
    `);

    // 5. Dept Map table (USN code -> Dept)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS dept_map (
        usn_code VARCHAR(20) PRIMARY KEY,
        dept VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed verified USN mappings (Never guess)
    await conn.query(`
      INSERT INTO dept_map (usn_code, dept)
      VALUES ('CS', 'CSE')
      ON CONFLICT (usn_code) DO UPDATE SET dept = EXCLUDED.dept;
    `);

    // 6. Users table extensions (nullable, preserves existing users)
    await conn.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS scheme_id INT REFERENCES schemes(id) ON DELETE SET NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS dept VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS semester INT;
    `);

    // Sync scheme_id, dept, semester for existing student accounts if available in students table
    await conn.query(`
      UPDATE users u
      SET 
        dept = COALESCE(u.dept, s.department),
        semester = COALESCE(u.semester, s.semester),
        scheme_id = COALESCE(
          u.scheme_id, 
          (SELECT id FROM schemes WHERE name = CASE 
            WHEN s.scheme LIKE '%2025%' THEN '2025' 
            WHEN s.scheme LIKE '%2022%' THEN '2022'
            ELSE '2022' 
          END LIMIT 1)
        )
      FROM students s
      WHERE u.user_id = s.user_id AND (u.scheme_id IS NULL OR u.dept IS NULL OR u.semester IS NULL);
    `);

    // 7. Indexes
    await conn.query(`
      CREATE INDEX IF NOT EXISTS idx_subjects_scheme_dept_sem ON subjects(scheme_id, dept, semester);
      CREATE INDEX IF NOT EXISTS idx_lab_programs_subject ON lab_programs(subject_id);
    `);

    await conn.commit();
    console.log('✅ Migration UP completed successfully!');
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error('❌ Migration UP failed:', err);
    throw err;
  } finally {
    conn.release();
  }
}

async function down() {
  console.log('🔄 Running Migration: VTU Scheme-Aware Curriculum (DOWN)...');
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(`DROP INDEX IF EXISTS idx_subjects_scheme_dept_sem;`);
    await conn.query(`DROP INDEX IF EXISTS idx_lab_programs_subject;`);

    await conn.query(`
      ALTER TABLE users DROP COLUMN IF EXISTS scheme_id;
      ALTER TABLE users DROP COLUMN IF EXISTS dept;
      ALTER TABLE users DROP COLUMN IF EXISTS semester;
    `);

    await conn.query(`DROP TABLE IF EXISTS dept_map;`);
    await conn.query(`DROP TABLE IF EXISTS student_subjects;`);
    await conn.query(`DROP TABLE IF EXISTS lab_programs CASCADE;`);
    await conn.query(`DROP TABLE IF EXISTS subjects CASCADE;`);
    // Note: schemes table may have other references so drop if cascade
    // await conn.query(\`DROP TABLE IF EXISTS schemes CASCADE;\`);

    await conn.commit();
    console.log('✅ Migration DOWN completed successfully!');
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error('❌ Migration DOWN failed:', err);
    throw err;
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  const action = process.argv[2] || 'up';
  const runner = action === 'down' ? down : up;
  runner()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { up, down };
