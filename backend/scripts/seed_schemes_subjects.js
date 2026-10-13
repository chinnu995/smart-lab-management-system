/**
 * Idempotent Seed Script: VTU Schemes & Placeholder Sample Subjects/Programs
 * NOTE: Contains ONLY sample placeholder data clearly marked as [SAMPLE].
 * Real syllabus data will be imported via CSV or admin portal.
 */
const db = require('../src/config/db');

async function seed() {
  console.log('🌱 Starting Idempotent Seeding for Schemes & Sample Curriculum...');
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Seed VTU Schemes
    const schemesData = [
      { name: '2022 Scheme', year_label: '2022' },
      { name: '2021 Scheme', year_label: '2021' },
      { name: '2025 Scheme', year_label: '2025' },
    ];

    const schemeMap = {}; // name -> id

    for (const s of schemesData) {
      await conn.query(`
        INSERT INTO schemes (name, year_label)
        VALUES (?, ?)
        ON CONFLICT (name) DO UPDATE SET year_label = EXCLUDED.year_label
      `, [s.name, s.year_label]);

      const [rows] = await conn.query('SELECT id FROM schemes WHERE name = ?', [s.name]);
      if (rows && rows[0]) {
        schemeMap[s.name] = rows[0].id;
      }
    }

    console.log('✓ Schemes seeded:', schemeMap);

    // 2. Sample Placeholder Subjects (Clearly marked as [SAMPLE])
    const sampleSubjects = [
      {
        scheme_name: '2022 Scheme',
        dept: 'Computer Science & Engineering',
        semester: 3,
        code: 'SAMPLE-22CSL31',
        name: '[SAMPLE] Data Structures Laboratory',
        description: 'Sample placeholder syllabus for 3rd semester CSE under 2022 Scheme.',
        type: 'lab',
        icon_key: 'Binary',
        programs: [
          {
            program_no: 1,
            title: '[SAMPLE] Array Implementation of Stack & Queue',
            description: 'Demonstration placeholder program for Stack and Queue operations.',
            language: 'python',
            starter_code: {
              python: '# [SAMPLE] Write Stack operations\ndef solve():\n    pass\n',
              c: '// [SAMPLE] Write Stack operations in C\n#include <stdio.h>\nint main() { return 0; }\n'
            },
            test_cases: [
              { input: 'PUSH 10\nPOP', output: '10' }
            ]
          },
          {
            program_no: 2,
            title: '[SAMPLE] Singly Linked List Traversal & Search',
            description: 'Demonstration placeholder program for Singly Linked List operations.',
            language: 'python',
            starter_code: {
              python: '# [SAMPLE] Implement Singly Linked List\n',
              c: '// [SAMPLE] Linked list in C\n'
            },
            test_cases: [
              { input: 'INSERT 5\nPRINT', output: '5' }
            ]
          }
        ]
      },
      {
        scheme_name: '2022 Scheme',
        dept: 'Computer Science & Engineering',
        semester: 4,
        code: 'SAMPLE-22CSL41',
        name: '[SAMPLE] Analysis & Design of Algorithms Lab',
        description: 'Sample placeholder syllabus for 4th semester CSE under 2022 Scheme.',
        type: 'lab',
        icon_key: 'Cpu',
        programs: [
          {
            program_no: 1,
            title: '[SAMPLE] Quick Sort & Merge Sort Comparison',
            description: 'Demonstration placeholder program to compare sorting time complexities.',
            language: 'python',
            starter_code: {
              python: '# [SAMPLE] Implement Quick Sort\n'
            },
            test_cases: [
              { input: '4 2 1 3', output: '1 2 3 4' }
            ]
          }
        ]
      },
      {
        scheme_name: '2021 Scheme',
        dept: 'Computer Science & Engineering',
        semester: 3,
        code: 'SAMPLE-21CSL31',
        name: '[SAMPLE] Data Structures with C Lab',
        description: 'Sample placeholder syllabus for 3rd semester CSE under 2021 Scheme.',
        type: 'lab',
        icon_key: 'Binary',
        programs: [
          {
            program_no: 1,
            title: '[SAMPLE] Stack Operations using C',
            description: 'Demonstration placeholder program for 2021 scheme stack implementation.',
            language: 'c',
            starter_code: {
              c: '#include <stdio.h>\nint main() {\n    printf("Sample Stack\\n");\n    return 0;\n}\n'
            },
            test_cases: [
              { input: '1', output: 'Sample Stack' }
            ]
          }
        ]
      },
      {
        scheme_name: '2022 Scheme',
        dept: 'Information Science & Engineering',
        semester: 3,
        code: 'SAMPLE-22ISL31',
        name: '[SAMPLE] Data Structures & Applications Lab',
        description: 'Sample placeholder syllabus for 3rd semester ISE under 2022 Scheme.',
        type: 'lab',
        icon_key: 'Terminal',
        programs: [
          {
            program_no: 1,
            title: '[SAMPLE] Circular Queue Implementation',
            description: 'Demonstration placeholder program for Circular Queue.',
            language: 'python',
            starter_code: { python: '# [SAMPLE] Circular Queue\n' },
            test_cases: []
          }
        ]
      }
    ];

    for (const sub of sampleSubjects) {
      const schemeId = schemeMap[sub.scheme_name];
      if (!schemeId) continue;

      // Upsert subject
      await conn.query(`
        INSERT INTO subjects (scheme_id, dept, semester, code, name, description, type, icon_key)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (scheme_id, dept, semester, code) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          type = EXCLUDED.type,
          icon_key = EXCLUDED.icon_key
      `, [schemeId, sub.dept, sub.semester, sub.code, sub.name, sub.description, sub.type, sub.icon_key]);

      const [subRows] = await conn.query(`
        SELECT id FROM subjects
        WHERE scheme_id = ? AND dept = ? AND semester = ? AND code = ?
      `, [schemeId, sub.dept, sub.semester, sub.code]);

      const subjectId = subRows[0]?.id;
      if (!subjectId) continue;

      // Upsert programs
      for (const prog of sub.programs) {
        await conn.query(`
          INSERT INTO lab_programs (subject_id, program_no, title, description, starter_code, test_cases, language)
          VALUES (?, ?, ?, ?, ?::jsonb, ?::jsonb, ?)
          ON CONFLICT (subject_id, program_no) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            starter_code = EXCLUDED.starter_code,
            test_cases = EXCLUDED.test_cases,
            language = EXCLUDED.language
        `, [
          subjectId,
          prog.program_no,
          prog.title,
          prog.description,
          JSON.stringify(prog.starter_code || {}),
          JSON.stringify(prog.test_cases || []),
          prog.language || 'python'
        ]);
      }
    }

    // Set fallback scheme for any existing student record that lacks one
    await conn.query(`
      UPDATE students
      SET scheme = '2022 Scheme'
      WHERE scheme IS NULL OR TRIM(scheme) = ''
    `);

    await conn.commit();
    console.log('✅ Idempotent seed finished successfully!');
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = seed;
