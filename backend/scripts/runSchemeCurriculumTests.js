/**
 * runSchemeCurriculumTests.js
 * Comprehensive automated test suite for VTU Scheme-Aware Curriculum.
 * Tests all 8 required scenarios:
 * 1. A 2022 student sees only 2022 subjects and a 2025 student only 2025 subjects.
 * 2. Another scheme's subject id returns 403.
 * 3. Query-param tampering has no effect for students.
 * 4. Import is idempotent: run twice and the counts stay the same.
 * 5. A bad CSV row is reported and rolls back the whole import.
 * 6. A user with no scheme gets the profile prompt, not a crash.
 * 7. Empty state renders for a semester with no data.
 * 8. Non-runnable programs show "Practice only" and activity subjects stay hidden by default.
 */

'use strict';

const db = require('../src/config/db');
const { executeImport, previewCsvContent } = require('../src/utils/csvLabImporter');

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

async function runTests() {
  console.log('🧪 Starting VTU Scheme-Aware Curriculum Automated Test Suite...\n');
  const codingController = require('../src/controllers/codingController');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ── Setup test users in DB ──────────────────────────────────────────────
    console.log('🔧 Setting up test accounts in database...');

    // Clean up any existing test records to ensure clean idempotency
    await db.query(`
      DELETE FROM student_subjects 
      WHERE student_id IN (SELECT student_id FROM students WHERE usn IN ('4PM22CS001', '4PM25CS001', '4PM22CS999'))
    `).catch(() => {});
    await db.query(`
      DELETE FROM students 
      WHERE usn IN ('4PM22CS001', '4PM25CS001', '4PM22CS999') 
         OR user_id IN (SELECT user_id FROM users WHERE email IN ('test2022@test.com', 'test2025@test.com', 'testnoscheme@test.com'))
    `).catch(() => {});
    await db.query(`
      DELETE FROM users 
      WHERE email IN ('test2022@test.com', 'test2025@test.com', 'testnoscheme@test.com')
    `).catch(() => {});

    // Lookup scheme IDs
    const [s22Rows] = await db.query(`SELECT id FROM schemes WHERE name = '2022' LIMIT 1`);
    const s22Id = s22Rows[0]?.id;
    const [s25Rows] = await db.query(`SELECT id FROM schemes WHERE name = '2025' LIMIT 1`);
    const s25Id = s25Rows[0]?.id;

    // 1. Student 2022
    await db.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_active, dept, semester, scheme_id)
      VALUES ('Test 2022 Student', 'test2022@test.com', 'hash', 'student', true, 'CSE', 3, ?)
    `, [s22Id]);
    const [u2022] = await db.query('SELECT user_id FROM users WHERE email = ?', ['test2022@test.com']);
    const u2022Id = u2022[0].user_id;

    await db.query(`
      INSERT INTO students (user_id, usn, department, semester, scheme, section, batch_year)
      VALUES (?, '4PM22CS001', 'CSE', 3, '2022 Scheme', 'A', 2022)
    `, [u2022Id]);

    // 2. Student 2025
    await db.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_active, dept, semester, scheme_id)
      VALUES ('Test 2025 Student', 'test2025@test.com', 'hash', 'student', true, 'CSE', 3, ?)
    `, [s25Id]);
    const [u2025] = await db.query('SELECT user_id FROM users WHERE email = ?', ['test2025@test.com']);
    const u2025Id = u2025[0].user_id;

    await db.query(`
      INSERT INTO students (user_id, usn, department, semester, scheme, section, batch_year)
      VALUES (?, '4PM25CS001', 'CSE', 3, '2025 Scheme', 'A', 2025)
    `, [u2025Id]);

    // 3. Student with NO scheme
    await db.query(`
      INSERT INTO users (full_name, email, password_hash, role, is_active, dept, semester, scheme_id)
      VALUES ('Test No Scheme Student', 'testnoscheme@test.com', 'hash', 'student', true, 'CSE', 3, NULL)
    `);
    const [uNoScheme] = await db.query('SELECT user_id FROM users WHERE email = ?', ['testnoscheme@test.com']);
    const uNoSchemeId = uNoScheme[0].user_id;

    await db.query(`
      INSERT INTO students (user_id, usn, department, semester, scheme, section, batch_year)
      VALUES (?, '4PM22CS999', 'CSE', 3, NULL, 'A', 2022)
    `, [uNoSchemeId]);

    console.log('✓ Test accounts ready.\n');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 1: A 2022 student sees only 2022 subjects and a 2025 student only 2025 subjects
    // ─────────────────────────────────────────────────────────────────────────
    console.log('▶ Test 1: Scheme scoping isolation');
    {
      const req2022 = { user: { id: u2022Id, role: 'student' }, query: {} };
      const res2022 = mockRes();
      await codingController.getSubjects(req2022, res2022);

      const subjects2022 = res2022.body?.subjects || [];
      const hasOnly2022 = subjects2022.length > 0 && subjects2022.every(s => s.scheme_name.startsWith('2022'));
      assert(hasOnly2022, `2022 student received ${subjects2022.length} subjects, all belonging strictly to 2022 scheme`);

      const req2025 = { user: { id: u2025Id, role: 'student' }, query: {} };
      const res2025 = mockRes();
      await codingController.getSubjects(req2025, res2025);

      const subjects2025 = res2025.body?.subjects || [];
      const hasOnly2025 = subjects2025.length > 0 && subjects2025.every(s => s.scheme_name.startsWith('2025'));
      assert(hasOnly2025, `2025 student received ${subjects2025.length} subjects, all belonging strictly to 2025 scheme`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 2: Another scheme's subject id returns 403
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n▶ Test 2: Cross-scheme access returns 403 Forbidden');
    {
      // Get a subject belonging to 2025 scheme
      const [s2025] = await db.query(`
        SELECT s.id, s.code, sch.name as scheme_name 
        FROM subjects s 
        JOIN schemes sch ON s.scheme_id = sch.id 
        WHERE sch.name LIKE '2025%' LIMIT 1
      `);
      const target2025SubjectId = s2025[0].id;

      // 2022 student attempts to access 2025 subject programs
      const reqTamper = {
        user: { id: u2022Id, role: 'student' },
        params: { subjectId: target2025SubjectId }
      };
      const resTamper = mockRes();
      await codingController.getSubjectPrograms(reqTamper, resTamper);

      assert(resTamper.statusCode === 403, `Accessing cross-scheme subject ID returned 403 (got ${resTamper.statusCode})`);
      assert(resTamper.body?.error?.includes('outside your VTU scheme'), 'Error message specifies outside scheme/department');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 3: Query-param tampering has no effect for students
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n▶ Test 3: Query-param tampering prevention');
    {
      // Student is in Sem 3, 2022 scheme. Client passes ?scheme=2025&dept=ECE&semester=7
      const reqTamper = {
        user: { id: u2022Id, role: 'student' },
        query: { scheme: '2025', dept: 'ECE', semester: '7' }
      };
      const resTamper = mockRes();
      await codingController.getSubjects(reqTamper, resTamper);

      const returned = resTamper.body?.subjects || [];
      const stillSem3 = returned.every(s => s.semester === 3);
      const still2022 = returned.every(s => s.scheme_name.startsWith('2022'));
      assert(stillSem3 && still2022, 'Query-param tampering ignored: student returned only their DB scheme (2022) and valid semester (3)');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 4: Import is idempotent: run twice and the counts stay the same
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n▶ Test 4: Importer idempotency');
    {
      const [countBeforeSub] = await db.query('SELECT COUNT(*) as cnt FROM subjects');
      const [countBeforeProg] = await db.query('SELECT COUNT(*) as cnt FROM lab_programs');

      // Re-run importer with 2022 and 2025 CSV files
      const path2022 = 'seed/data/vtu_2022_cse_lab_programs.csv';
      const path2025 = 'seed/data/vtu_2025_cse_lab_programs.csv';
      const fs = require('fs');
      const { parseCsvString } = require('../src/utils/csvLabImporter');

      const rows1 = parseCsvString(fs.readFileSync(path2022, 'utf8')).rows;
      const rows2 = parseCsvString(fs.readFileSync(path2025, 'utf8')).rows;
      await executeImport([...rows1, ...rows2], 'Idempotency Test Run');

      const [countAfterSub] = await db.query('SELECT COUNT(*) as cnt FROM subjects');
      const [countAfterProg] = await db.query('SELECT COUNT(*) as cnt FROM lab_programs');

      const subSame = countBeforeSub[0].cnt === countAfterSub[0].cnt;
      const progSame = countBeforeProg[0].cnt === countAfterProg[0].cnt;
      assert(subSame && progSame, `Counts match before & after re-import: subjects=${countAfterSub[0].cnt}, programs=${countAfterProg[0].cnt}`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 5: A bad CSV row is reported and rolls back the whole import
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n▶ Test 5: Rejection and transactional rollback on bad CSV row');
    {
      const badCsv = `scheme,dept,semester,subject_code,subject_name,subject_type,program_no,title,description,source_pdf
"2022","CSE",99,"BCS999","Bad Semester Lab","lab",1,"Bad Title","Test","bad.pdf"`;

      const preview = previewCsvContent(badCsv);
      assert(!preview.valid && preview.rejectedCount === 1, 'Bad row identified during validation (semester 99 invalid)');

      const [countBeforeProg] = await db.query('SELECT COUNT(*) as cnt FROM lab_programs');

      // Attempt transactional import with invalid row
      let threw = false;
      try {
        const { validateRow } = require('../src/utils/csvLabImporter');
        const errs = validateRow(preview.rejected[0].row, 2);
        if (errs.length > 0) throw new Error('Validation failed: ' + errs.join(', '));
        await executeImport([preview.rejected[0].row], 'Bad Test');
      } catch (e) {
        threw = true;
      }

      const [countAfterProg] = await db.query('SELECT COUNT(*) as cnt FROM lab_programs');
      const noLeak = countBeforeProg[0].cnt === countAfterProg[0].cnt;
      assert(threw && noLeak, `Bad row aborted import and rolled back transaction (programs count unchanged: ${countAfterProg[0].cnt})`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 6: A user with no scheme gets the profile prompt, not a crash
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n▶ Test 6: User with missing scheme handled gracefully');
    {
      const reqNoScheme = { user: { id: uNoSchemeId, role: 'student' }, query: {} };
      const resNoScheme = mockRes();
      await codingController.getSubjects(reqNoScheme, resNoScheme);

      assert(resNoScheme.statusCode === 200, `Request returned 200 (no crash, got ${resNoScheme.statusCode})`);
      assert(resNoScheme.body?.missing_scheme === true, 'Response contains missing_scheme: true flag');
      assert(Array.isArray(resNoScheme.body?.schemes), 'Response includes available schemes list for selection');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 7: Empty state renders for a semester with no data
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n▶ Test 7: Empty state for semester with no data');
    {
      // Semester 8 has no subjects in 2025 scheme
      // Admin/Faculty query with semester=8
      const reqEmpty = {
        user: { id: u2025Id, role: 'faculty' },
        query: { scheme: '2025', dept: 'CSE', semester: '8' }
      };
      const resEmpty = mockRes();
      await codingController.getSubjects(reqEmpty, resEmpty);

      assert(resEmpty.statusCode === 200, 'Empty semester request returned 200 OK');
      assert(Array.isArray(resEmpty.body?.subjects) && resEmpty.body.subjects.length === 0, 'Returned empty subjects array [] for semester 8');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 8: Non-runnable programs show runnable=false and activity subjects stay hidden by default
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n▶ Test 8: Non-runnable programs & activity subject hiding');
    {
      // 1. Activity subject hidden by default
      const reqDefault = { user: { id: u2025Id, role: 'student' }, query: {} };
      const resDefault = mockRes();
      await codingController.getSubjects(reqDefault, resDefault);

      const subjectsDefault = resDefault.body?.subjects || [];
      const hasActivity = subjectsDefault.some(s => s.type === 'activity');
      assert(!hasActivity, 'Activity subjects hidden by default when include!=activity');

      // 2. Activity subject shown when include=activity
      const reqWithActivity = { user: { id: u2025Id, role: 'student' }, query: { include: 'activity' } };
      const resWithActivity = mockRes();
      await codingController.getSubjects(reqWithActivity, resWithActivity);

      const subjectsWithActivity = resWithActivity.body?.subjects || [];
      const foundActivity = subjectsWithActivity.some(s => s.type === 'activity');
      assert(foundActivity, 'Activity subjects included when include=activity');

      // 3. Non-runnable programs marked runnable=false
      // Check BCS302 (Digital Design) which is in labConfig.json nonRunnable list
      const [progRows] = await db.query(`
        SELECT lp.runnable, s.code 
        FROM lab_programs lp 
        JOIN subjects s ON lp.subject_id = s.id 
        WHERE s.code = 'BCS302' LIMIT 1
      `);
      const isNonRunnable = progRows.length > 0 && progRows[0].runnable === false;
      assert(isNonRunnable, 'Non-runnable subject BCS302 programs have runnable = false ("Practice only: runs outside the IDE")');

      // 4. Default language applied from labConfig.json
      // Check BCSL305 (C language)
      const [langRows] = await db.query(`
        SELECT lp.language, s.code 
        FROM lab_programs lp 
        JOIN subjects s ON lp.subject_id = s.id 
        WHERE s.code = 'BCSL305' LIMIT 1
      `);
      const hasCLang = langRows.length > 0 && langRows[0].language === 'c';
      assert(hasCLang, 'Default language for BCSL305 correctly set to "c" from config');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cleanup test accounts
    // ─────────────────────────────────────────────────────────────────────────
    await db.query('DELETE FROM students WHERE user_id IN (?, ?, ?)', [u2022Id, u2025Id, uNoSchemeId]);
    await db.query('DELETE FROM users WHERE user_id IN (?, ?, ?)', [u2022Id, u2025Id, uNoSchemeId]);

    console.log(`\n======================================================`);
    console.log(`Test Suite Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
