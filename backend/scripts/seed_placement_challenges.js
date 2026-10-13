const db = require('../src/config/db');
const { PLACEMENT_PATTERNS } = require('../src/data/placementPatterns');

(async () => {
  console.log('Seeding placement patterns into coding_challenges...');
  let count = 0;
  for (const pat of PLACEMENT_PATTERNS) {
    await db.query(`
      INSERT INTO coding_challenges (title, slug, difficulty, category, week_number, description, input_format, output_format, constraints, sample_cases, hidden_cases, starter_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        difficulty = EXCLUDED.difficulty,
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        input_format = EXCLUDED.input_format,
        output_format = EXCLUDED.output_format,
        constraints = EXCLUDED.constraints,
        sample_cases = EXCLUDED.sample_cases,
        hidden_cases = EXCLUDED.hidden_cases,
        starter_code = EXCLUDED.starter_code
    `, [
      pat.title,
      pat.slug,
      pat.difficulty,
      pat.subject.toUpperCase(),
      1,
      `${pat.description}\n\n**Placement Frequency:** ${pat.frequency}\n**Top Companies:** ${(pat.companyTags || []).join(', ')}`,
      pat.input_format,
      pat.output_format,
      pat.constraints,
      JSON.stringify(pat.sample_cases),
      JSON.stringify(pat.hidden_cases || pat.sample_cases),
      JSON.stringify(pat.starter_code)
    ]).catch(e => console.error('Error inserting', pat.slug, e));
    count++;
  }
  console.log('Successfully upserted', count, 'placement challenges into database!');
  process.exit(0);
})();
