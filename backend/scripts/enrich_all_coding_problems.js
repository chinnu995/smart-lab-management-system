require('dotenv').config();
const db = require('../src/config/db');
const { enrichProblem } = require('../src/utils/problemSpecEnricher');

async function enrichAllProblems() {
  console.log('🚀 Starting enrichment of all coding problems and lab programs...');

  // 1. Ensure lab_programs has columns input_format, output_format, constraints if not present
  await db.query('ALTER TABLE lab_programs ADD COLUMN IF NOT EXISTS input_format TEXT').catch(() => {});
  await db.query('ALTER TABLE lab_programs ADD COLUMN IF NOT EXISTS output_format TEXT').catch(() => {});
  await db.query('ALTER TABLE lab_programs ADD COLUMN IF NOT EXISTS constraints TEXT').catch(() => {});

  // 2. Fetch all lab_programs
  const [labPrograms] = await db.query(`
    SELECT lp.*, s.name as subject_name, s.code as subject_code
    FROM lab_programs lp
    JOIN subjects s ON lp.subject_id = s.id
    ORDER BY lp.id ASC
  `);

  console.log(`Found ${labPrograms.length} lab programs to enrich.`);
  let lpCount = 0;

  for (const lp of labPrograms) {
    const enriched = enrichProblem({
      ...lp,
      category: lp.subject_name
    });

    await db.query(`
      UPDATE lab_programs
      SET description = ?,
          input_format = ?,
          output_format = ?,
          constraints = ?,
          test_cases = ?::jsonb,
          starter_code = ?::jsonb
      WHERE id = ?
    `, [
      enriched.description,
      enriched.input_format,
      enriched.output_format,
      enriched.constraints,
      JSON.stringify(enriched.sample_cases),
      JSON.stringify(enriched.starter_code),
      lp.id
    ]);
    lpCount++;
  }
  console.log(`✓ Successfully enriched ${lpCount} lab programs.`);

  // 3. Fetch all coding_challenges
  const [challenges] = await db.query(`
    SELECT * FROM coding_challenges
    ORDER BY problem_id ASC
  `);

  console.log(`Found ${challenges.length} coding challenges to inspect.`);
  let ccCount = 0;

  for (const cc of challenges) {
    const enriched = enrichProblem(cc);

    await db.query(`
      UPDATE coding_challenges
      SET description = ?,
          input_format = ?,
          output_format = ?,
          constraints = ?,
          sample_cases = ?::jsonb,
          starter_code = ?::jsonb
      WHERE problem_id = ?
    `, [
      enriched.description,
      enriched.input_format,
      enriched.output_format,
      enriched.constraints,
      JSON.stringify(enriched.sample_cases),
      JSON.stringify(enriched.starter_code),
      cc.problem_id
    ]);
    ccCount++;
  }
  console.log(`✓ Successfully enriched ${ccCount} coding challenges.`);

  console.log('🎉 All problems in every subject successfully enriched with comprehensive specifications and 5 test cases!');
  process.exit(0);
}

enrichAllProblems().catch(err => {
  console.error('Error during enrichment:', err);
  process.exit(1);
});
