/**
 * CSV Import Tool: Scheme-Aware Curriculum & Lab Programs
 * Columns: scheme, dept, semester, subject_code, subject_name, program_no, title, description
 */
const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

/**
 * Basic RFC 4180 compliant CSV line parser handling quotes and commas
 */
function parseCsvLine(text) {
  const p = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      p.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  p.push(cur.trim());
  return p;
}

function parseCsvString(csvString) {
  const lines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 1 && values[0] === '') continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Imports curriculum rows into the database using parameterized queries.
 * @param {Array<Object>|string} input - Array of parsed objects or raw CSV string
 * @returns {Promise<{success: boolean, summary: Object, errors: Array}>}
 */
async function importCurriculumData(input) {
  let rows = [];
  if (typeof input === 'string') {
    rows = parseCsvString(input);
  } else if (Array.isArray(input)) {
    rows = input;
  } else {
    throw new Error('Input must be a CSV string or an array of row objects');
  }

  const conn = await db.getConnection();
  const summary = {
    totalRows: rows.length,
    processedSubjects: 0,
    processedPrograms: 0,
    errors: []
  };

  try {
    await conn.beginTransaction();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowNum = i + 2;

      // Extract and normalize fields
      const schemeName = (r.scheme || r.scheme_name || '').trim();
      const dept = (r.dept || r.department || '').trim();
      const semester = parseInt(r.semester, 10);
      const subjectCode = (r.subject_code || r.code || '').trim().toUpperCase();
      const subjectName = (r.subject_name || r.name || '').trim();
      const programNo = parseInt(r.program_no || r.program_number, 10);
      const title = (r.title || r.program_title || '').trim();
      const description = (r.description || '').trim();

      // Validation
      if (!schemeName) {
        summary.errors.push(`Row ${rowNum}: Missing 'scheme'`);
        continue;
      }
      if (!dept) {
        summary.errors.push(`Row ${rowNum}: Missing 'dept'`);
        continue;
      }
      if (isNaN(semester) || semester < 1 || semester > 8) {
        summary.errors.push(`Row ${rowNum}: Invalid 'semester' (must be between 1 and 8)`);
        continue;
      }
      if (!subjectCode || !subjectName) {
        summary.errors.push(`Row ${rowNum}: Missing 'subject_code' or 'subject_name'`);
        continue;
      }

      // 1. Ensure scheme exists
      let schemeId;
      const [existingScheme] = await conn.query('SELECT id FROM schemes WHERE LOWER(name) = LOWER(?)', [schemeName]);
      if (existingScheme && existingScheme.length > 0) {
        schemeId = existingScheme[0].id;
      } else {
        const yearLabel = schemeName.match(/\d{4}/)?.[0] || '2022';
        const [newScheme] = await conn.query(
          'INSERT INTO schemes (name, year_label) VALUES (?, ?) RETURNING id',
          [schemeName, yearLabel]
        );
        schemeId = newScheme[0]?.id || newScheme.insertId;
      }

      // 2. Upsert subject
      await conn.query(`
        INSERT INTO subjects (scheme_id, dept, semester, code, name, description, type, icon_key)
        VALUES (?, ?, ?, ?, ?, ?, 'lab', 'Code2')
        ON CONFLICT (scheme_id, dept, semester, code) DO UPDATE SET
          name = EXCLUDED.name,
          description = COALESCE(EXCLUDED.description, subjects.description)
      `, [schemeId, dept, semester, subjectCode, subjectName, description || null]);

      const [subRows] = await conn.query(
        'SELECT id FROM subjects WHERE scheme_id = ? AND dept = ? AND semester = ? AND code = ?',
        [schemeId, dept, semester, subjectCode]
      );
      const subjectId = subRows[0]?.id;
      summary.processedSubjects++;

      // 3. Upsert lab program if program_no and title provided
      if (!isNaN(programNo) && title && subjectId) {
        await conn.query(`
          INSERT INTO lab_programs (subject_id, program_no, title, description, starter_code, test_cases, language)
          VALUES (?, ?, ?, ?, '{}'::jsonb, '[]'::jsonb, 'python')
          ON CONFLICT (subject_id, program_no) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description
        `, [subjectId, programNo, title, description || null]);
        summary.processedPrograms++;
      }
    }

    await conn.commit();
    return { success: true, summary };
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

// CLI Runner
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log('Usage: node scripts/import_curriculum_csv.js <path-to-csv>');
    process.exit(1);
  }

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolved, 'utf-8');
  importCurriculumData(content)
    .then((res) => {
      console.log('✅ Import Completed:');
      console.log(`- Total CSV rows: ${res.summary.totalRows}`);
      console.log(`- Processed subjects: ${res.summary.processedSubjects}`);
      console.log(`- Processed programs: ${res.summary.processedPrograms}`);
      if (res.summary.errors.length) {
        console.warn('⚠️ Warnings/Errors:', res.summary.errors);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ CSV Import failed:', err);
      process.exit(1);
    });
}

module.exports = {
  importCurriculumData,
  parseCsvString
};
