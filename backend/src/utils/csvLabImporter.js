/**
 * csvLabImporter.js
 * Shared VTU Lab Programs CSV parser, validator, and transactional importer.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const audit = require('./audit');

// Load labConfig.json
const LAB_CONFIG_PATH = path.join(__dirname, '../../config/labConfig.json');
let labConfig = { nonRunnable: [], defaultLanguage: {} };
try {
  if (fs.existsSync(LAB_CONFIG_PATH)) {
    labConfig = JSON.parse(fs.readFileSync(LAB_CONFIG_PATH, 'utf8'));
  }
} catch (e) {
  console.warn('Could not read labConfig.json:', e.message);
}

const NON_RUNNABLE_SET = new Set((labConfig.nonRunnable || []).map(c => c.toUpperCase()));
const DEFAULT_LANGUAGE = labConfig.defaultLanguage || {};
const ALLOWED_TYPES = new Set(['lab', 'elective', 'activity', 'theory']);

function parseCsvLine(text) {
  const fields = [];
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
      fields.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

function parseCsvString(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return { headers, rows };
}

function validateRow(row, lineNum) {
  const errors = [];
  const required = ['scheme', 'dept', 'semester', 'subject_code', 'subject_name', 'subject_type', 'program_no', 'title'];
  for (const f of required) {
    if (!row[f] || row[f].toString().trim() === '') {
      errors.push(`field '${f}' is missing or empty`);
    }
  }
  const sem = parseInt(row.semester, 10);
  if (isNaN(sem) || sem < 1 || sem > 8) {
    errors.push(`semester '${row.semester}' is not a valid integer 1–8`);
  }

  const prog = parseInt(row.program_no, 10);
  if (isNaN(prog) || prog < 1) {
    errors.push(`program_no '${row.program_no}' is not a valid positive integer`);
  }

  if (row.subject_type && !ALLOWED_TYPES.has(row.subject_type.toLowerCase())) {
    errors.push(`subject_type '${row.subject_type}' not in ('lab','elective','activity','theory')`);
  }
  return errors;
}

function previewCsvContent(csvString) {
  const { headers, rows } = parseCsvString(csvString);
  const REQUIRED_COLS = ['scheme', 'dept', 'semester', 'subject_code', 'subject_name', 'subject_type', 'program_no', 'title', 'description', 'source_pdf'];
  const missingCols = REQUIRED_COLS.filter(c => !headers.includes(c));

  if (missingCols.length > 0) {
    return {
      valid: false,
      error: `Missing required columns: ${missingCols.join(', ')}`,
      totalRows: rows.length,
      errors: [`Missing columns: ${missingCols.join(', ')}`],
      preview: []
    };
  }

  const rejected = [];
  const validRows = [];

  for (let i = 0; i < rows.length; i++) {
    const rowErrors = validateRow(rows[i], i + 2);
    if (rowErrors.length > 0) {
      rejected.push({ line: i + 2, row: rows[i], errors: rowErrors });
    } else {
      validRows.push(rows[i]);
    }
  }

  return {
    valid: rejected.length === 0,
    totalRows: rows.length,
    validCount: validRows.length,
    rejectedCount: rejected.length,
    rejected,
    preview: validRows.slice(0, 10)
  };
}

async function executeImport(validRows, sourceLabel = 'CSV Upload', userId = 0, userIp = 'localhost') {
  const conn = await db.getConnection();
  const summary = {
    totalRead: validRows.length,
    totalValid: validRows.length,
    legacyDeleted: [],
    subjectsCreated: 0,
    programsCreated: 0
  };

  try {
    await conn.beginTransaction();

    // 1. Delete legacy BCO402 if present
    const [legacyRows] = await conn.query('SELECT s.id FROM subjects s WHERE s.code = ?', ['BCO402']);
    if (legacyRows && legacyRows.length > 0) {
      await conn.query('DELETE FROM subjects WHERE code = ?', ['BCO402']);
      summary.legacyDeleted.push('BCO402');
    }

    // 2. Upsert schemes
    const schemeCache = {};
    const distinctSchemes = [...new Set(validRows.map(r => r.scheme.trim()))];
    for (const schemeName of distinctSchemes) {
      await conn.query(
        'INSERT INTO schemes (name) VALUES (?) ON CONFLICT (name) DO NOTHING',
        [schemeName]
      );
      const [rows] = await conn.query('SELECT id FROM schemes WHERE name = ?', [schemeName]);
      if (rows && rows[0]) {
        schemeCache[schemeName] = rows[0].id;
      } else {
        throw new Error(`Could not resolve scheme id for '${schemeName}'`);
      }
    }

    // 3. Upsert subjects & programs
    const subjectCache = {};
    for (const row of validRows) {
      const schemeName = row.scheme.trim();
      const dept = row.dept.trim();
      const semester = parseInt(row.semester, 10);
      const code = row.subject_code.trim().toUpperCase();
      const subjectName = row.subject_name.trim();
      const subjectType = row.subject_type.trim().toLowerCase();
      const programNo = parseInt(row.program_no, 10);
      const title = row.title.trim();
      const description = (row.description || '').trim();
      const sourcePdf = (row.source_pdf || '').trim();

      const schemeId = schemeCache[schemeName];
      if (!schemeId) throw new Error(`Unknown scheme: ${schemeName}`);

      const runnable = !NON_RUNNABLE_SET.has(code);
      const langKey = Object.keys(DEFAULT_LANGUAGE).find(k => k.toUpperCase() === code);
      const language = langKey ? DEFAULT_LANGUAGE[langKey] : null;

      const cacheKey = `${schemeId}|${dept}|${semester}|${code}`;
      if (!subjectCache[cacheKey]) {
        await conn.query(`
          INSERT INTO subjects (scheme_id, dept, semester, code, name, type)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT (scheme_id, dept, semester, code)
          DO UPDATE SET
            name = EXCLUDED.name,
            type = EXCLUDED.type
        `, [schemeId, dept, semester, code, subjectName, subjectType]);

        const [sRows] = await conn.query(
          'SELECT id FROM subjects WHERE scheme_id=? AND dept=? AND semester=? AND code=?',
          [schemeId, dept, semester, code]
        );
        if (!sRows || !sRows[0]) throw new Error(`Could not resolve subject id for ${code}`);
        subjectCache[cacheKey] = sRows[0].id;
        summary.subjectsCreated++;
      }

      const subjectId = subjectCache[cacheKey];

      await conn.query(`
        INSERT INTO lab_programs (subject_id, program_no, title, description, source, runnable, language)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (subject_id, program_no)
        DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          source = EXCLUDED.source,
          runnable = EXCLUDED.runnable,
          language = EXCLUDED.language
      `, [subjectId, programNo, title, description, sourcePdf, runnable, language]);
      summary.programsCreated++;
    }

    await conn.commit();

    audit.log(
      userId,
      'IMPORT_LAB_PROGRAMS',
      'lab_programs',
      null,
      `Imported ${summary.totalValid} programs across ${Object.keys(subjectCache).length} subjects via ${sourceLabel}`,
      userIp
    );

    return { success: true, summary };
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  parseCsvLine,
  parseCsvString,
  validateRow,
  previewCsvContent,
  executeImport
};
