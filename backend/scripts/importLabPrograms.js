/**
 * importLabPrograms.js
 * Idempotent VTU lab program CSV importer.
 *
 * Usage:
 *   node scripts/importLabPrograms.js <csv1> [csv2] [csv3] ...
 * npm script:
 *   "seed:labs": "node scripts/importLabPrograms.js seed/data/vtu_2022_cse_lab_programs.csv seed/data/vtu_2022_cse_labs_addon.csv seed/data/vtu_2025_cse_lab_programs.csv"
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseCsvString, validateRow, executeImport } = require('../src/utils/csvLabImporter');

async function importLabPrograms(csvPaths) {
  if (!csvPaths || csvPaths.length === 0) {
    console.error('Usage: node scripts/importLabPrograms.js <csv1> [csv2] ...');
    process.exit(1);
  }

  const allValidRows = [];
  const allRejected = [];
  let totalRead = 0;

  for (const csvPath of csvPaths) {
    const absPath = path.isAbsolute(csvPath) ? csvPath : path.join(process.cwd(), csvPath);
    if (!fs.existsSync(absPath)) {
      console.error(`❌ File not found: ${absPath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(absPath, 'utf8');
    const { headers, rows } = parseCsvString(content);

    const REQUIRED_COLS = ['scheme', 'dept', 'semester', 'subject_code', 'subject_name', 'subject_type', 'program_no', 'title', 'description', 'source_pdf'];
    const missingCols = REQUIRED_COLS.filter(c => !headers.includes(c));
    if (missingCols.length > 0) {
      console.error(`❌ ${path.basename(absPath)}: missing columns: ${missingCols.join(', ')}`);
      process.exit(1);
    }

    console.log(`📄 ${path.basename(absPath)}: ${rows.length} data rows`);
    totalRead += rows.length;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 2;
      const errors = validateRow(row, lineNum);
      if (errors.length > 0) {
        allRejected.push({ file: path.basename(absPath), line: lineNum, row, errors });
      } else {
        allValidRows.push(row);
      }
    }
  }

  if (allRejected.length > 0) {
    console.error(`\n❌ ${allRejected.length} row(s) failed validation — ABORTING (no DB changes made):\n`);
    for (const r of allRejected) {
      console.error(`  [${r.file} line ${r.line}] ${r.errors.join('; ')}`);
      console.error(`    → ${JSON.stringify(r.row)}`);
    }
    process.exit(1);
  }

  console.log(`\n✅ All ${allValidRows.length} rows validated. Starting import…`);

  try {
    const result = await executeImport(allValidRows, csvPaths.map(p => path.basename(p)).join(', '));
    const summary = result.summary;

    const db = require('../src/config/db');
    const [breakdown] = await db.query(`
      SELECT sc.name AS scheme, s.semester, s.code, s.name AS subject, COUNT(lp.id) AS prog_count
      FROM subjects s
      JOIN schemes sc ON sc.id = s.scheme_id
      LEFT JOIN lab_programs lp ON lp.subject_id = s.id
      WHERE sc.name IN ('2022','2025')
      GROUP BY sc.name, s.semester, s.code, s.name
      ORDER BY sc.name, s.semester, s.code
    `);

    console.log('\n══════════════════════════════════════════');
    console.log('  IMPORT SUMMARY');
    console.log('══════════════════════════════════════════');
    console.log(`  CSV rows read    : ${totalRead}`);
    console.log(`  Rows rejected    : 0`);
    console.log(`  Rows imported    : ${summary.totalValid}`);
    if (summary.legacyDeleted.length > 0) {
      console.log(`  Legacy deleted   : ${summary.legacyDeleted.join(', ')}`);
    }
    console.log('──────────────────────────────────────────');
    console.log('  Subjects & program counts post-import:');
    let lastScheme = '';
    for (const r of breakdown) {
      if (r.scheme !== lastScheme) {
        console.log(`\n  [${r.scheme} Scheme]`);
        lastScheme = r.scheme;
      }
      console.log(`    Sem ${r.semester}  ${r.code.padEnd(14)} ${r.prog_count} programs  (${r.subject})`);
    }
    console.log('\n══════════════════════════════════════════\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Import FAILED — all changes rolled back.');
    console.error(err);
    process.exit(1);
  }
}

const csvArgs = process.argv.slice(2);
importLabPrograms(csvArgs);
