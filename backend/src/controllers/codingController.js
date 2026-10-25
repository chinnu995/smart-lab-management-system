const db = require('../config/db');
const { executeCode, runTestCases } = require('../services/codeRunner');
const { generateTestQuestions } = require('../services/aiProvider');
const { PLACEMENT_PATTERNS } = require('../data/placementPatterns');
const { enrichProblem } = require('../utils/problemSpecEnricher');

const SKILL_CATEGORIES = [
  { id: 'dsa', name: 'DSA', icon: 'Binary', count: 10, description: 'Data Structures & Algorithms, Trees, Graphs & Dynamic Programming' },
  { id: 'ada', name: 'ADA', icon: 'Cpu', count: 10, description: 'Analysis & Design of Algorithms, Sorting, Searching & Graphs' },
  { id: 'dbms', name: 'DBMS', icon: 'Database', count: 10, description: 'Database Management Systems, Relational Algebra & SQL' },
  { id: 'latex', name: 'LATEX', icon: 'FileText', count: 8, description: 'LaTeX Document Formatting, Mathematical Typesetting & Tables' },
  { id: 'mongodb', name: 'MONGODB', icon: 'Server', count: 10, description: 'NoSQL Document Database, Aggregation & BSON Queries' },
  { id: 'ai', name: 'AI', icon: 'Bot', count: 10, description: 'Artificial Intelligence, Heuristic Search & Machine Learning' },
  { id: 'java', name: 'JAVA', icon: 'Coffee', count: 12, description: 'Java OOPs, Primitive Types, Collections & Exception Handling' },
  { id: 'python', name: 'PYTHON', icon: 'Terminal', count: 12, description: 'Python Scripting, List Comprehensions & Data Structures' },
  { id: 'os', name: 'OPERATING SYSTEMS', icon: 'TerminalSquare', count: 10, description: 'Process Management, Synchronization & Shell Commands' }
];

/**
 * Helper to retrieve conducted lab subjects for student / faculty
 */
async function getConductedSubjects(userId, role) {
  if (role === 'hod') return null; // HOD sees all

  const conductedSubjects = new Set();

  if (role === 'faculty') {
    // 1. Faculty assigned subject
    const [facRows] = await db.query('SELECT subject FROM faculty WHERE user_id = ?', [userId]).catch(() => [[]]);
    if (facRows && facRows[0] && facRows[0].subject) {
      facRows[0].subject.split(',').forEach(s => { if (s.trim()) conductedSubjects.add(s.trim().toUpperCase()); });
    }

    // 2. Labs conducted by this faculty (attendance records)
    const [attRows] = await db.query(`
      SELECT DISTINCT l.lab_name
      FROM attendance a
      JOIN labs l ON a.lab_id = l.lab_id
      WHERE a.faculty_id = (SELECT faculty_id FROM faculty WHERE user_id = ?)
    `, [userId]).catch(() => [[]]);
    (attRows || []).forEach(r => { if (r.lab_name) conductedSubjects.add(r.lab_name.toUpperCase().trim()); });

    // 3. Tests created by faculty
    const [testRows] = await db.query('SELECT DISTINCT subject FROM tests WHERE created_by = ?', [userId]).catch(() => [[]]);
    (testRows || []).forEach(r => { if (r.subject) conductedSubjects.add(r.subject.toUpperCase().trim()); });
  } else {
    // Student - Include all conducted faculty subjects, timetable labs, attendance labs, and coding categories
    // 1. Faculty assigned subjects
    const [facRows] = await db.query('SELECT DISTINCT subject FROM faculty WHERE subject IS NOT NULL AND TRIM(subject) != ""').catch(() => [[]]);
    (facRows || []).forEach(r => {
      if (r.subject) {
        r.subject.split(',').forEach(s => { if (s.trim()) conductedSubjects.add(s.trim().toUpperCase()); });
      }
    });

    // 2. Labs conducted in attendance
    const [attRows] = await db.query(`
      SELECT DISTINCT l.lab_name, f.subject AS faculty_subject
      FROM attendance a
      LEFT JOIN labs l ON a.lab_id = l.lab_id
      LEFT JOIN faculty f ON a.faculty_id = f.faculty_id
    `).catch(() => [[]]);
    (attRows || []).forEach(r => {
      if (r.lab_name) conductedSubjects.add(r.lab_name.toUpperCase().trim());
      if (r.faculty_subject) conductedSubjects.add(r.faculty_subject.toUpperCase().trim());
    });

    // 3. Timetable subjects
    const [ttRows] = await db.query('SELECT DISTINCT subject FROM timetable WHERE subject IS NOT NULL').catch(() => [[]]);
    (ttRows || []).forEach(r => {
      if (r.subject) conductedSubjects.add(r.subject.toUpperCase().trim());
    });

    // 4. Categories in coding challenges
    const [catRows] = await db.query('SELECT DISTINCT category FROM coding_challenges WHERE category IS NOT NULL').catch(() => [[]]);
    (catRows || []).forEach(r => {
      if (r.category) conductedSubjects.add(r.category.toUpperCase().trim());
    });
  }

  // Fallback default
  if (conductedSubjects.size === 0) {
    SKILL_CATEGORIES.forEach(cat => conductedSubjects.add(cat.name.toUpperCase()));
  }

  return Array.from(conductedSubjects);
}

const { DEFAULT_STARTER_CODE, ALL_VTU_LAB_PROBLEMS } = require('../data/vtuLabProblems');

async function autoSeedVtuAdaLabPrograms() {
  for (const prob of ALL_VTU_LAB_PROBLEMS) {
    await db.query(`
      INSERT INTO coding_challenges (title, slug, difficulty, category, week_number, description, input_format, output_format, constraints, sample_cases, hidden_cases, starter_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        difficulty = EXCLUDED.difficulty,
        category = EXCLUDED.category,
        week_number = EXCLUDED.week_number,
        description = EXCLUDED.description,
        input_format = EXCLUDED.input_format,
        output_format = EXCLUDED.output_format,
        constraints = EXCLUDED.constraints,
        sample_cases = EXCLUDED.sample_cases,
        hidden_cases = EXCLUDED.hidden_cases,
        starter_code = EXCLUDED.starter_code
    `, [
      prob.title,
      prob.slug,
      prob.difficulty,
      prob.category.toUpperCase(),
      prob.week_number,
      prob.description,
      prob.input_format,
      prob.output_format,
      prob.constraints,
      JSON.stringify(prob.sample_cases),
      JSON.stringify(prob.sample_cases),
      JSON.stringify(prob.starter_code)
    ]).catch(e => { console.error('Error seeding VTU Lab Program:', e); });
  }

  // Update existing coding_challenges table to clear out solutions from starter_code
  await db.query(`
    UPDATE coding_challenges
    SET starter_code = ?::jsonb
  `, [JSON.stringify(DEFAULT_STARTER_CODE)]).catch(e => {});
}

// GET /api/coding/categories
exports.getCategories = async (req, res) => {
  try {
    autoSeedVtuAdaLabPrograms().catch(() => {});
    const userId = req.user?.id;
    const userRole = req.user?.role || 'student';

    const conductedList = await getConductedSubjects(userId, userRole);

    const [counts] = await db.query(`
      SELECT category, COUNT(*) as problem_count
      FROM coding_challenges
      WHERE slug NOT LIKE 'placement-pattern-%'
      GROUP BY category
    `);
    
    const countMap = {};
    (counts || []).forEach(c => { countMap[c.category.toUpperCase()] = parseInt(c.problem_count); });

    const categoriesMap = new Map();
    SKILL_CATEGORIES.forEach(cat => {
      categoriesMap.set(cat.name.toUpperCase(), {
        ...cat,
        count: countMap[cat.name.toUpperCase()] || 0
      });
    });

    (counts || []).forEach(c => {
      const catUpper = c.category.toUpperCase();
      if (!categoriesMap.has(catUpper)) {
        categoriesMap.set(catUpper, {
          id: catUpper.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: catUpper,
          icon: 'Code2',
          count: parseInt(c.problem_count),
          description: `${catUpper} curriculum coding challenges & lab exercises.`
        });
      }
    });

    let categories = Array.from(categoriesMap.values());

    // Filter categories to ONLY conducted lab subjects unless HOD
    if (conductedList !== null && conductedList.length > 0) {
      categories = categories.filter(cat =>
        conductedList.some(cSubj => 
          cSubj.toLowerCase() === cat.name.toLowerCase() || 
          cat.name.toLowerCase().includes(cSubj.toLowerCase()) || 
          cSubj.toLowerCase().includes(cat.name.toLowerCase())
        )
      );
    }

    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// POST /api/coding/problems (HOD / Faculty)
exports.createProblem = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let {
      title, difficulty, category, week_number, description,
      input_format, output_format, constraints,
      sample_cases, hidden_cases, starter_code
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Force category to faculty's assigned subject if user is faculty
    if (userRole === 'faculty') {
      const [facRows] = await db.query('SELECT subject FROM faculty WHERE user_id = ?', [userId]);
      if (facRows && facRows[0] && facRows[0].subject) {
        category = facRows[0].subject;
      }
    }

    if (!category) category = 'GENERAL';
    category = category.toUpperCase().trim();

    // Generate unique slug
    let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug || `problem-${Date.now()}`;
    const [existing] = await db.query('SELECT problem_id FROM coding_challenges WHERE slug = ?', [slug]);
    if (existing && existing.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const sampleArr = Array.isArray(sample_cases) ? sample_cases : (typeof sample_cases === 'string' && sample_cases ? JSON.parse(sample_cases) : [{ input: '', output: '' }]);
    const hiddenArr = Array.isArray(hidden_cases) ? hidden_cases : (typeof hidden_cases === 'string' && hidden_cases ? JSON.parse(hidden_cases) : [{ input: '', output: '' }]);
    const starterObj = starter_code && typeof starter_code === 'object' ? starter_code : (typeof starter_code === 'string' && starter_code ? JSON.parse(starter_code) : { python: '# Write solution here\n', java: '// Write solution here\n' });

    // Ensure created_by column exists
    await db.query('ALTER TABLE coding_challenges ADD COLUMN IF NOT EXISTS created_by INT').catch(() => {});

    const [resInsert] = await db.query(`
      INSERT INTO coding_challenges (
        title, slug, difficulty, category, week_number, description,
        input_format, output_format, constraints, sample_cases, hidden_cases, starter_code, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING problem_id
    `, [
      title, slug, difficulty || 'Easy', category,
      parseInt(week_number) || 1, description,
      input_format || '', output_format || '', constraints || '',
      JSON.stringify(sampleArr), JSON.stringify(hiddenArr), JSON.stringify(starterObj), userId
    ]);

    const problemId = resInsert[0]?.problem_id || resInsert.insertId;

    res.status(201).json({
      message: 'Coding challenge created successfully',
      problem_id: problemId,
      slug,
      category
    });
  } catch (err) {
    console.error('Error creating coding problem:', err);
    res.status(500).json({ error: 'Failed to create coding problem', details: err.message });
  }
};

// GET /api/coding/problems
exports.getProblems = async (req, res) => {
  try {
    autoSeedVtuAdaLabPrograms().catch(() => {});
    const { category, difficulty } = req.query;
    const userId = req.user?.id;
    const activeWeek = 1; // 1 program unlocked per week

    // Resolve student_id
    let studentId = 0;
    if (userId) {
      const [sRows] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
      studentId = sRows[0]?.student_id || 0;
    }

    let query = `
      SELECT cc.problem_id, cc.title, cc.slug, cc.difficulty, cc.category, cc.week_number, cc.created_at,
             (SELECT status FROM coding_submissions cs WHERE cs.problem_id = cc.problem_id AND cs.student_id = ? ORDER BY cs.submission_id DESC LIMIT 1) AS user_status,
             (SELECT COUNT(*) FROM coding_submissions cs WHERE cs.problem_id = cc.problem_id) AS total_submissions,
             (SELECT COUNT(*) FROM coding_submissions cs WHERE cs.problem_id = cc.problem_id AND cs.status = 'Accepted') AS accepted_submissions
      FROM coding_challenges cc
      WHERE cc.slug NOT LIKE 'placement-pattern-%'
    `;

    const userRole = req.user?.role || 'student';
    const conductedList = await getConductedSubjects(userId, userRole);

    const params = [studentId];

    if (category && category !== 'all') {
      query += ` AND LOWER(cc.category) LIKE ?`;
      params.push(`%${category.toLowerCase()}%`);
    } else if (conductedList !== null && conductedList.length > 0) {
      const clauses = conductedList.map(() => `LOWER(cc.category) LIKE ?`).join(' OR ');
      query += ` AND (${clauses})`;
      conductedList.forEach(cSubj => params.push(`%${cSubj.toLowerCase()}%`));
    }

    if (difficulty && difficulty !== 'all') {
      query += ` AND LOWER(cc.difficulty) = ?`;
      params.push(difficulty.toLowerCase());
    }

    query += ` ORDER BY cc.week_number ASC, cc.problem_id ASC`;

    const [rows] = await db.query(query, params);
    
    // Also fetch from lab_programs if filtering by category or all
    let labProgramRows = [];
    try {
      let lpQuery = `
        SELECT lp.id as problem_id, lp.title, ('program-' || lp.id) as slug, 'Medium' as difficulty,
               s.name as category, lp.program_no as week_number, lp.created_at,
               (SELECT status FROM coding_submissions cs WHERE cs.problem_id = lp.id AND cs.student_id = ?) AS user_status,
               (SELECT COUNT(*) FROM coding_submissions cs WHERE cs.problem_id = lp.id) AS total_submissions,
               (SELECT COUNT(*) FROM coding_submissions cs WHERE cs.problem_id = lp.id AND cs.status = 'Accepted') AS accepted_submissions
        FROM lab_programs lp
        JOIN subjects s ON lp.subject_id = s.id
        WHERE 1=1
      `;
      const lpParams = [studentId];

      if (req.query.subject_id) {
        lpQuery += ` AND s.id = ?`;
        lpParams.push(req.query.subject_id);
      } else if (category && category !== 'all') {
        if (!isNaN(category)) {
          lpQuery += ` AND s.id = ?`;
          lpParams.push(category);
        } else {
          lpQuery += ` AND (LOWER(s.name) LIKE ? OR LOWER(s.code) = ?)`;
          lpParams.push(`%${category.toLowerCase()}%`, category.toLowerCase());
        }
      }

      lpQuery += ` ORDER BY lp.program_no ASC`;
      const [lpRes] = await db.query(lpQuery, lpParams);
      labProgramRows = lpRes || [];
    } catch (e) {
      console.error('Error fetching lab_programs in getProblems:', e);
    }

    const allRows = labProgramRows.length > 0 && category && category !== 'all' && (!rows || rows.length === 0)
      ? labProgramRows
      : [...(rows || []), ...labProgramRows];

    const problems = allRows.map(r => {
      const total = parseInt(r.total_submissions) || 0;
      const accepted = parseInt(r.accepted_submissions) || 0;
      const accuracy = total > 0 ? Math.round((accepted / total) * 100) : 100;
      const weekNum = r.week_number || 1;

      return {
        ...r,
        accuracy,
        solved: r.user_status === 'Accepted',
        isLocked: false,
        weekNumber: weekNum,
        unlockStatus: `Unlocked • Program ${weekNum}`
      };
    });

    res.json(problems);
  } catch (err) {
    console.error('Error fetching problems:', err);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
};

function ensure5Cases(cases = [], problem = null) {
  const list = [...(Array.isArray(cases) ? cases : [])];
  if (list.length >= 5) return list.slice(0, 5);

  const enriched = problem ? enrichProblem(problem) : null;
  const enrichedDefaults = enriched?.sample_cases || [];

  const defaults = enrichedDefaults.length >= 5 ? enrichedDefaults : [
    { input: '1', output: 'Sample Output 1', explanation: 'Sample test case 1 evaluation' },
    { input: '2', output: 'Sample Output 2', explanation: 'Sample test case 2 evaluation' },
    { input: '3', output: 'Sample Output 3', explanation: 'Sample test case 3 evaluation' },
    { input: '4', output: 'Sample Output 4', explanation: 'Sample test case 4 evaluation' },
    { input: '5', output: 'Sample Output 5', explanation: 'Sample test case 5 evaluation' }
  ];

  while (list.length < 5) {
    const fallback = defaults[list.length] || {
      input: `Sample Input ${list.length + 1}`,
      output: `Sample Output ${list.length + 1}`,
      explanation: `Test case ${list.length + 1} evaluation`
    };
    list.push(fallback);
  }
  return list;
}

// GET /api/coding/problems/:id
exports.getProblemDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const isNum = !isNaN(id);
    
    const query = isNum 
      ? 'SELECT * FROM coding_challenges WHERE problem_id = ?'
      : 'SELECT * FROM coding_challenges WHERE slug = ?';
    
    const [rows] = await db.query(query, [id]);
    let problem = rows[0];

    if (!problem) {
      let pRows = [];
      if (isNum) {
        const [resP] = await db.query(`
          SELECT lp.*, s.name as subject_name, s.code as subject_code
          FROM lab_programs lp
          JOIN subjects s ON lp.subject_id = s.id
          WHERE lp.id = ?
        `, [id]);
        pRows = resP;
      } else if (String(id).startsWith('program-')) {
        const progId = parseInt(String(id).replace('program-', ''));
        const [resP] = await db.query(`
          SELECT lp.*, s.name as subject_name, s.code as subject_code
          FROM lab_programs lp
          JOIN subjects s ON lp.subject_id = s.id
          WHERE lp.id = ?
        `, [progId]);
        pRows = resP;
      }

      if (pRows && pRows.length) {
        const lp = pRows[0];
        problem = {
          problem_id: lp.id,
          title: lp.title,
          slug: `program-${lp.id}`,
          difficulty: 'Medium',
          category: lp.subject_name,
          week_number: lp.program_no,
          description: lp.description,
          input_format: lp.input_format || null,
          output_format: lp.output_format || null,
          constraints: lp.constraints || null,
          sample_cases: lp.test_cases,
          starter_code: lp.starter_code,
          language: lp.language,
          subject_code: lp.subject_code,
          subject_name: lp.subject_name
        };
      }
    }

    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Enrich problem with academic description, input/output format, constraints, and test cases
    problem = enrichProblem(problem);

    const weekNum = problem.week_number || 1;
    
    // Check if student has already submitted this coding challenge
    let isSubmitted = false;
    let userSubmission = null;
    if (req.user && req.user.role === 'student') {
      const [sRows] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.id]);
      if (sRows.length) {
        const studentId = sRows[0].student_id;
        const [subRows] = await db.query(
          'SELECT submission_id, status, passed_cases, total_cases, language, code FROM coding_submissions WHERE problem_id = ? AND student_id = ? ORDER BY submission_id DESC LIMIT 1',
          [problem.problem_id, studentId]
        );
        if (subRows.length) {
          isSubmitted = true;
          userSubmission = subRows[0];
        }
      }
    }

    // Parse JSON fields safely & ensure 5 test cases
    let sampleCases = [];
    let starterCode = {};
    try { sampleCases = typeof problem.sample_cases === 'string' ? JSON.parse(problem.sample_cases) : problem.sample_cases; } catch(e){}
    try { starterCode = typeof problem.starter_code === 'string' ? JSON.parse(problem.starter_code) : problem.starter_code; } catch(e){}

    sampleCases = ensure5Cases(sampleCases, problem);

    // Do NOT send hidden_cases to client
    res.json({
      problemId: problem.problem_id,
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      category: problem.category,
      weekNumber: weekNum,
      description: problem.description,
      inputFormat: problem.input_format,
      outputFormat: problem.output_format,
      constraints: problem.constraints,
      sampleCases,
      starterCode,
      isSubmitted,
      userSubmission
    });
  } catch (err) {
    console.error('Error fetching problem details:', err);
    res.status(500).json({ error: 'Failed to fetch problem details' });
  }
};

// POST /api/coding/run
exports.runCode = async (req, res) => {
  try {
    const { problemId, language, code, customInput } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Code content cannot be empty' });
    }

    if (customInput !== undefined && customInput !== null && customInput.trim() !== '') {
      // Test against custom input
      const result = await executeCode(language, code, customInput);
      return res.json({
        custom: true,
        passed: !result.error,
        stdout: result.stdout,
        stderr: result.stderr,
        executionTimeMs: result.executionTimeMs,
        error: result.error
      });
    }

    // Run against 5 sample cases
    let [pRows] = await db.query('SELECT * FROM coding_challenges WHERE problem_id = ?', [problemId]);
    let problem = pRows[0];
    if (!problem) {
      const [lpRows] = await db.query(`
        SELECT lp.*, s.name as subject_name, s.code as subject_code
        FROM lab_programs lp
        JOIN subjects s ON lp.subject_id = s.id
        WHERE lp.id = ?
      `, [problemId]);
      if (lpRows.length) {
        problem = lpRows[0];
      }
    }

    if (problem) {
      problem = enrichProblem(problem);
    }

    let sampleCases = [];
    if (problem) {
      try { sampleCases = typeof problem.sample_cases === 'string' ? JSON.parse(problem.sample_cases) : problem.sample_cases; } catch(e){}
    }

    sampleCases = ensure5Cases(sampleCases, problem);

    const evaluation = await runTestCases(language, code, sampleCases);
    res.json({
      custom: false,
      passedCount: evaluation.passedCount,
      totalCount: evaluation.totalCount,
      allPassed: evaluation.allPassed,
      results: evaluation.results
    });
  } catch (err) {
    console.error('Error running code:', err);
    res.status(500).json({ error: 'Code execution failed', details: err.message });
  }
};

// POST /api/coding/submit
exports.submitCode = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    const userId = req.user.id;

    const [sRows] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
    if (!sRows.length) {
      return res.status(403).json({ error: 'Only registered students can submit coding challenges' });
    }
    const studentId = sRows[0].student_id;

    // Fetch testcases & ensure 5 testcases
    let [pRows] = await db.query('SELECT * FROM coding_challenges WHERE problem_id = ?', [problemId]);
    let problem = pRows[0];
    if (!problem) {
      const [lpRows] = await db.query(`
        SELECT lp.*, s.name as subject_name, s.code as subject_code
        FROM lab_programs lp
        JOIN subjects s ON lp.subject_id = s.id
        WHERE lp.id = ?
      `, [problemId]);
      if (lpRows.length) {
        problem = lpRows[0];
      }
    }
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    problem = enrichProblem(problem);

    let sampleCases = [];
    let hiddenCases = [];
    try { sampleCases = typeof problem.sample_cases === 'string' ? JSON.parse(problem.sample_cases) : problem.sample_cases; } catch(e){}
    try { hiddenCases = typeof problem.hidden_cases === 'string' ? JSON.parse(problem.hidden_cases) : problem.hidden_cases; } catch(e){}

    const allCases = ensure5Cases([...sampleCases, ...(hiddenCases || [])], problem);
    const evaluation = await runTestCases(language, code, allCases);

    let status = 'Accepted';
    if (!evaluation.allPassed) {
      const hasError = evaluation.results.some(r => r.stderr);
      status = hasError ? 'Compilation Error' : 'Wrong Answer';
    }

    const totalTime = evaluation.results.reduce((acc, r) => acc + (r.executionTimeMs || 0), 0);
    const firstStdout = evaluation.results[0]?.actualOutput || '';

    // Insert submission record
    const [subResult] = await db.query(`
      INSERT INTO coding_submissions (problem_id, student_id, language, code, status, passed_cases, total_cases, execution_time_ms, stdout)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING submission_id
    `, [
      problemId, studentId, language, code, status,
      evaluation.passedCount, evaluation.totalCount, totalTime, firstStdout
    ]);

    const submissionId = subResult[0]?.submission_id || subResult.insertId;

    res.json({
      submissionId,
      status,
      passedCases: evaluation.passedCount,
      totalCases: evaluation.totalCount,
      allPassed: evaluation.allPassed,
      executionTimeMs: totalTime,
      results: evaluation.results.map(r => ({
        testCase: r.testCase,
        passed: r.passed,
        executionTimeMs: r.executionTimeMs
      }))
    });
  } catch (err) {
    console.error('Error submitting code:', err);
    res.status(500).json({ error: 'Submission failed', details: err.message });
  }
};

// GET /api/coding/problems/:id/submissions
exports.getSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [sRows] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
    const studentId = sRows[0]?.student_id || 0;

    const [rows] = await db.query(`
      SELECT submission_id, language, status, passed_cases, total_cases, execution_time_ms, submitted_at, code
      FROM coding_submissions
      WHERE problem_id = ? AND student_id = ?
      ORDER BY submitted_at DESC
    `, [id, studentId]);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

// GET /api/coding/admin/submissions — HOD/Faculty view student coding submissions
exports.getAllSubmissionsForAdmin = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let facultySubject = null;
    if (userRole === 'faculty') {
      const [facRows] = await db.query('SELECT subject FROM faculty WHERE user_id = ?', [userId]);
      facultySubject = facRows[0]?.subject || null;
    }

    let query = `
      SELECT cs.submission_id, cs.language, cs.code, cs.status, cs.passed_cases, cs.total_cases, cs.execution_time_ms, cs.submitted_at,
             cc.title AS problem_title, cc.category, cc.week_number, cc.difficulty,
             u.full_name, s.usn, s.department, s.semester, s.section, s.scheme
      FROM coding_submissions cs
      JOIN coding_challenges cc ON cs.problem_id = cc.problem_id
      JOIN students s ON cs.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      WHERE 1=1
    `;

    const params = [];

    if (userRole === 'faculty' && facultySubject) {
      query += ` AND LOWER(cc.category) LIKE ?`;
      params.push(`%${facultySubject.toLowerCase()}%`);
    } else if (category && category !== 'all') {
      query += ` AND LOWER(cc.category) LIKE ?`;
      params.push(`%${category.toLowerCase()}%`);
    }

    if (status && status !== 'all') {
      query += ` AND LOWER(cs.status) = ?`;
      params.push(status.toLowerCase());
    }

    if (search && search.trim()) {
      query += ` AND (LOWER(u.full_name) LIKE ? OR LOWER(s.usn) LIKE ? OR LOWER(cc.title) LIKE ?)`;
      const q = `%${search.trim().toLowerCase()}%`;
      params.push(q, q, q);
    }

    query += ` ORDER BY cs.submitted_at DESC`;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching admin coding submissions:', err);
    res.status(500).json({ error: 'Failed to fetch coding submissions' });
  }
};

// GET /api/coding/admin/analytics — HOD & Faculty overview analytics for Coding Arena
exports.getCodingAnalytics = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let facultySubject = null;
    if (userRole === 'faculty') {
      const [facRows] = await db.query('SELECT subject FROM faculty WHERE user_id = ?', [userId]);
      facultySubject = facRows[0]?.subject || null;
    }

    let totalQuery = `SELECT COUNT(*) AS total FROM coding_submissions cs JOIN coding_challenges cc ON cs.problem_id = cc.problem_id`;
    let acceptedQuery = `SELECT COUNT(*) AS accepted FROM coding_submissions cs JOIN coding_challenges cc ON cs.problem_id = cc.problem_id WHERE cs.status = 'Accepted'`;
    let uniqueQuery = `SELECT COUNT(DISTINCT cs.student_id) AS student_count FROM coding_submissions cs JOIN coding_challenges cc ON cs.problem_id = cc.problem_id`;
    
    const queryParams = [];
    if (userRole === 'faculty' && facultySubject) {
      const p = `%${facultySubject.toLowerCase()}%`;
      totalQuery += ` WHERE LOWER(cc.category) LIKE ?`;
      acceptedQuery += ` AND LOWER(cc.category) LIKE ?`;
      uniqueQuery += ` WHERE LOWER(cc.category) LIKE ?`;
      queryParams.push(p);
    }

    const [totalSubs] = await db.query(totalQuery, queryParams);
    const [acceptedSubs] = await db.query(acceptedQuery, queryParams.length ? queryParams : []);
    const [uniqueStudents] = await db.query(uniqueQuery, queryParams.length ? queryParams : []);

    let byCatQuery = `
      SELECT cc.category, COUNT(cs.submission_id) AS submission_count,
             COUNT(CASE WHEN cs.status = 'Accepted' THEN 1 END) AS accepted_count
      FROM coding_challenges cc
      LEFT JOIN coding_submissions cs ON cc.problem_id = cs.problem_id
    `;
    const catParams = [];
    if (userRole === 'faculty' && facultySubject) {
      byCatQuery += ` WHERE LOWER(cc.category) LIKE ?`;
      catParams.push(`%${facultySubject.toLowerCase()}%`);
    }
    byCatQuery += ` GROUP BY cc.category`;

    const [byCategory] = await db.query(byCatQuery, catParams);

    let topQuery = `
      SELECT s.student_id, u.full_name, s.usn, s.department, s.scheme,
             COUNT(CASE WHEN cs.status = 'Accepted' THEN 1 END) AS solved_count,
             COUNT(cs.submission_id) AS total_attempts
      FROM coding_submissions cs
      JOIN coding_challenges cc ON cs.problem_id = cc.problem_id
      JOIN students s ON cs.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
    `;
    const topParams = [];
    if (userRole === 'faculty' && facultySubject) {
      topQuery += ` WHERE LOWER(cc.category) LIKE ?`;
      topParams.push(`%${facultySubject.toLowerCase()}%`);
    }
    topQuery += ` GROUP BY s.student_id, u.full_name, s.usn, s.department, s.scheme ORDER BY solved_count DESC, total_attempts ASC LIMIT 10`;

    const [topPerformers] = await db.query(topQuery, topParams);

    const total = parseInt(totalSubs[0]?.total || 0);
    const accepted = parseInt(acceptedSubs[0]?.accepted || 0);
    const passRate = total > 0 ? Math.round((accepted / total) * 100) : 100;

    res.json({
      totalSubmissions: total,
      acceptedSubmissions: accepted,
      uniqueStudents: parseInt(uniqueStudents[0]?.student_count || 0),
      passRate,
      byCategory,
      topPerformers,
      facultySubject
    });
  } catch (err) {
    console.error('Error fetching coding analytics:', err);
    res.status(500).json({ error: 'Failed to fetch coding analytics' });
  }
};

// GET /api/coding/problems/:id/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT cs.submission_id, cs.language, cs.execution_time_ms, cs.submitted_at,
             u.full_name, s.usn, s.department, s.scheme
      FROM coding_submissions cs
      JOIN students s ON cs.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      WHERE cs.problem_id = ? AND cs.status = 'Accepted'
      ORDER BY cs.execution_time_ms ASC, cs.submitted_at ASC
      LIMIT 20
    `, [id]);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

// GET /api/coding/placement-patterns
exports.getPlacementPatterns = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || 'student';
    const conductedList = await getConductedSubjects(userId, userRole);

    let patterns = PLACEMENT_PATTERNS;

    if (conductedList !== null && conductedList.length > 0) {
      const filtered = patterns.filter(p =>
        conductedList.some(cSubj =>
          cSubj.toLowerCase() === p.subject.toLowerCase() ||
          p.subject.toLowerCase().includes(cSubj.toLowerCase()) ||
          cSubj.toLowerCase().includes(p.subject.toLowerCase())
        )
      );
      if (filtered.length > 0) patterns = filtered;
    }

    // Respond immediately to the client (< 10ms)
    res.json(patterns);

    // Run auto-seeding asynchronously in background without blocking response
    (async () => {
      for (const pat of patterns) {
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
          `${pat.description}\n\n**Placement Frequency:** ${pat.frequency}\n**Top Companies:** ${pat.companyTags.join(', ')}`,
          pat.input_format,
          pat.output_format,
          pat.constraints,
          JSON.stringify(pat.sample_cases),
          JSON.stringify(pat.hidden_cases || pat.sample_cases),
          JSON.stringify(pat.starter_code)
        ]).catch(() => {});
      }
    })().catch(() => {});
  } catch (err) {
    console.error('Error fetching placement patterns:', err);
    res.status(500).json({ error: 'Failed to fetch placement patterns' });
  }
};

// =====================================================================
// SCHEME-AWARE CURRICULUM & SUBJECT ENDPOINTS
// =====================================================================

// Helper to resolve student's department code to match curriculum CSV department (e.g. 'CSE')
async function resolveStudentCsvDept(student) {
  let dept = (student.department || '').trim();
  if (!dept && student.dept) dept = student.dept.trim();

  // 1. Try USN branch code extraction (e.g. 4PM24IS018 -> IS, 4PM24CE011 -> CE, 1VA21CS002 -> CS)
  if (student.usn) {
    const cleanUsn = student.usn.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const match = cleanUsn.match(/\d{2}([A-Z]{2,3})\d+/);
    if (match) {
      const usnBranch = match[1];
      const [mapRows] = await db.query('SELECT dept FROM dept_map WHERE LOWER(usn_code) = LOWER(?)', [usnBranch]);
      if (mapRows && mapRows.length) {
        return mapRows[0].dept;
      }
      if (['CS', 'IS', 'ISE', 'CE', 'AI', 'AIML', 'DS', 'CD', 'CY', 'AD', 'AM', 'AL', 'CO', 'CB', 'CG', 'CI', 'SE', 'CSDS', 'CSD', 'CSBS', 'AIDS'].includes(usnBranch)) {
        return 'CSE';
      }
    }
  }

  // 2. Check dept_map for direct match of department name or code
  if (dept) {
    const [mapRows] = await db.query('SELECT dept FROM dept_map WHERE LOWER(usn_code) = LOWER(?)', [dept]);
    if (mapRows && mapRows.length) {
      return mapRows[0].dept;
    }
    const dLower = dept.toLowerCase();
    // Comprehensive CS Allied Department check: CSE, ISE/IS, AIML/AI, CSDS/DS, CSD/CD, Cyber Security/CY, Computer Engineering/CE, AIDS, etc.
    if (
      dLower.includes('computer') ||
      dLower.includes('information') ||
      dLower.includes('intelligence') ||
      dLower.includes('data science') ||
      dLower.includes('cyber') ||
      dLower.includes('design') ||
      dLower.includes('software') ||
      ['cse', 'cs', 'ce', 'ise', 'is', 'ai', 'aiml', 'ds', 'cd', 'cy', 'ad', 'am', 'al', 'co', 'cb', 'cg', 'ci', 'se', 'csbs', 'aids', 'csds'].includes(dLower)
    ) {
      return 'CSE';
    }
  }

  return dept || 'CSE';
}

// GET /api/coding/schemes
exports.getSchemes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, year_label FROM schemes ORDER BY id ASC');
    res.json(rows || []);
  } catch (err) {
    console.error('Error fetching schemes:', err);
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
};

// GET /api/coding/subjects?semester=N&include=activity
// - Students: scheme/dept from DB, semester defaults to enrolled semester or selected 1-8
// - Faculty/HOD: accept ?scheme= ?dept= ?semester= filters
exports.getSubjects = async (req, res) => {
  try {
    const userId   = req.user?.id;
    const userRole = req.user?.role || 'student';

    if (userRole === 'student') {
      // ── Always read credentials from DB ──────────────────────────────────
      const [sRows] = await db.query(
        'SELECT student_id, usn, department, semester, scheme, cycle FROM students WHERE user_id = ?',
        [userId]
      );
      if (!sRows || !sRows.length) {
        return res.status(404).json({ error: 'Student record not found' });
      }

      const student    = sRows[0];
      const studentDept = (student.department || '').trim();
      const studentSem  = parseInt(student.semester) || 1;
      const studentScheme = (student.scheme || '').trim();
      const rawCycle = (student.cycle || '').toUpperCase().trim();
      const studentCycle = rawCycle.includes('P') ? 'P' : rawCycle.includes('C') ? 'C' : null;

      // Handle no scheme set — return prompt
      if (!studentScheme) {
        const [allSchemes] = await db.query('SELECT id, name FROM schemes WHERE name IN (\'2022\',\'2025\') ORDER BY name ASC');
        return res.json({
          missing_scheme: true,
          studentInfo: { usn: student.usn, department: studentDept, semester: studentSem },
          schemes: allSchemes || [],
          subjects: []
        });
      }

      // Check if student has explicit scheme_id in users
      let schemeId = null;
      let schemeName = null;
      const [uRows] = await db.query('SELECT scheme_id FROM users WHERE user_id = ?', [userId]);
      if (uRows && uRows[0] && uRows[0].scheme_id) {
        const [schRow] = await db.query('SELECT id, name FROM schemes WHERE id = ?', [uRows[0].scheme_id]);
        if (schRow && schRow[0]) {
          schemeId = schRow[0].id;
          schemeName = schRow[0].name;
        }
      }

      const rawScheme = (studentScheme || schemeName || '').trim();
      const schemeYear = rawScheme.replace(/\D/g, '') || '2025';

      // Always resolve schemeId to the canonical scheme where subjects actually live for this year
      const [schSubjRows] = await db.query(
        `SELECT s.scheme_id, sch.name 
         FROM subjects s 
         JOIN schemes sch ON s.scheme_id = sch.id 
         WHERE sch.name = ? OR sch.name LIKE ? OR sch.year_label = ?
         ORDER BY CASE WHEN sch.name = ? THEN 0 ELSE 1 END, s.scheme_id DESC 
         LIMIT 1`,
        [schemeYear, `${schemeYear}%`, schemeYear, schemeYear]
      );

      if (schSubjRows && schSubjRows.length) {
        schemeId = schSubjRows[0].scheme_id;
        schemeName = schSubjRows[0].name;
      } else if (!schemeId) {
        const [schRows] = await db.query(
          `SELECT id, name FROM schemes WHERE name = ? OR name LIKE ? OR year_label = ? ORDER BY CASE WHEN name = ? THEN 0 ELSE 1 END, id DESC LIMIT 1`,
          [schemeYear, `${schemeYear}%`, schemeYear, schemeYear]
        );
        if (schRows && schRows.length) {
          schemeId = schRows[0].id;
          schemeName = schRows[0].name;
        }
      }

      if (!schemeId) {
        return res.json({
          missing_scheme: false,
          studentInfo: { scheme: studentScheme, department: studentDept, semester: studentSem },
          subjects: []
        });
      }

      // Students strictly see only their own current enrolled semester from DB
      const querySem = studentSem;

      const includeActivity = req.query.include === 'activity';
      const csvDept = await resolveStudentCsvDept(student);

      // Cycle-aware semester logic for 1st Year (Semester 1 & 2):
      // Sem 1:
      //   P-Cycle: Principles of Programming Using C (BPOPK103 / 1BPOPL107)
      //   C-Cycle: Chemistry Cycle (no programming lab)
      // Sem 2:
      //   P-Cycle: Introduction to Python Programming (BPLCK205B) / C Lab (1BPOPL207 in 2025)
      //   C-Cycle: Chemistry Cycle (no programming lab)
      let semCondition = 's.semester = ?';
      let semParam = querySem;

      if ((studentSem === 1 || studentSem === 2) && studentCycle) {
        if (studentCycle === 'P') {
          if (studentSem === 1) {
            // 1st Sem P-Cycle: C Programming
            if (schemeYear === '2022') {
              semCondition = "(s.code = 'BPOPK103' AND s.semester = ?)";
            } else {
              semCondition = "(s.code = '1BPOPL107' AND s.semester = ?)";
            }
          } else if (studentSem === 2) {
            // 2nd Sem P-Cycle: Python Programming Lab (BPLCK205B in 2022 Scheme)
            if (schemeYear === '2022') {
              semCondition = "(s.code = 'BPLCK205B' AND s.semester = ?)";
            } else {
              semCondition = "((s.code = 'BPLCK205B' OR s.code = '1BPOPL207') AND s.semester = ?)";
            }
          }
        } else if (studentCycle === 'C') {
          // C-Cycle in 1st or 2nd semester: Chemistry cycle (no programming lab)
          semCondition = "(s.id = -999 AND s.semester = ?)";
        }
      }

      // Fetch subjects, including elective chosen status
      const [subjects] = await db.query(`
        SELECT
          s.id, s.code, s.name, s.type, s.semester, s.dept,
          sch.name AS scheme_name,
          COUNT(lp.id)::int AS program_count,
          CASE WHEN ss.subject_id IS NOT NULL THEN true ELSE false END AS chosen
        FROM subjects s
        JOIN schemes sch ON sch.id = s.scheme_id
        LEFT JOIN lab_programs lp ON lp.subject_id = s.id
        LEFT JOIN student_subjects ss ON ss.subject_id = s.id AND ss.student_id = ?
        WHERE (s.scheme_id = ? OR s.scheme_id IN (
          SELECT id FROM schemes WHERE name = ? OR name LIKE ? OR year_label = ?
        ))
          AND LOWER(s.dept) = LOWER(?)
          AND ${semCondition}
          AND s.type IN ('lab','elective'${includeActivity ? ",'activity'" : ''})
        GROUP BY s.id, s.code, s.name, s.type, s.semester, s.dept, sch.name, ss.subject_id
        ORDER BY s.semester ASC, s.type ASC, s.code ASC
      `, [student.student_id, schemeId, schemeYear, `${schemeYear}%`, schemeYear, csvDept, semParam]);

      return res.json({
        missing_scheme: false,
        studentInfo: { scheme: schemeName, department: studentDept, semester: studentSem, cycle: studentCycle, usn: student.usn },
        subjects: subjects || []
      });
    }

    // ── Faculty & HOD: filter dropdowns allowed ──────────────────────────
    const { scheme, dept, semester } = req.query;
    const includeActivity = req.query.include === 'activity';

    let query = `
      SELECT
        s.id, s.code, s.name, s.type, s.semester, s.dept,
        sch.name AS scheme_name,
        COUNT(lp.id)::int AS program_count
      FROM subjects s
      JOIN schemes sch ON sch.id = s.scheme_id
      LEFT JOIN lab_programs lp ON lp.subject_id = s.id
      WHERE 1=1
        AND s.type IN ('lab','elective'${includeActivity ? ",'activity'" : ''})
    `;
    const params = [];

    if (scheme && scheme !== 'all') {
      const yr = scheme.replace(/\D/g, '');
      query += ` AND (sch.name = ? OR sch.name LIKE ?)`;
      params.push(yr, `${yr}%`);
    }
    if (dept && dept !== 'all') {
      query += ` AND LOWER(s.dept) = LOWER(?)`;
      params.push(dept);
    }
    if (semester && semester !== 'all') {
      query += ` AND s.semester = ?`;
      params.push(parseInt(semester));
    }

    query += `
      GROUP BY s.id, s.code, s.name, s.type, s.semester, s.dept, sch.name
      ORDER BY sch.name ASC, s.semester ASC, s.type ASC, s.code ASC
    `;

    const [subjects] = await db.query(query, params);
    const [allSchemes] = await db.query(`SELECT id, name FROM schemes WHERE name IN ('2022','2025') ORDER BY name ASC`);

    return res.json({ schemes: allSchemes || [], subjects: subjects || [] });
  } catch (err) {
    console.error('Error fetching scheme-aware subjects:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};


// GET /api/coding/subjects/:subjectId/programs
// 403 if the subject is outside the student's scheme and dept.
// Return program_no, title, description, source, runnable, language.
// NEVER return test_cases to students.
exports.getSubjectPrograms = async (req, res) => {
  try {
    const subjectId = req.params.subjectId || req.params.id;
    const userId = req.user?.id;
    const userRole = req.user?.role || 'student';

    // Fetch subject and scheme
    const [subRows] = await db.query(`
      SELECT s.id, s.code, s.name, s.type, s.semester, s.dept, sch.name AS scheme_name
      FROM subjects s
      JOIN schemes sch ON s.scheme_id = sch.id
      WHERE s.id = ?
    `, [subjectId]);

    if (!subRows || !subRows.length) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const subject = subRows[0];

    // Student scope enforcement
    if (userRole === 'student') {
      const [sRows] = await db.query(
        'SELECT student_id, scheme, department, semester FROM students WHERE user_id = ?',
        [userId]
      );
      if (!sRows || !sRows.length) {
        return res.status(404).json({ error: 'Student record not found' });
      }

      const student = sRows[0];
      const studentScheme = (student.scheme || '').replace(/\D/g, '');
      const subjectScheme = (subject.scheme_name || '').replace(/\D/g, '');
      const studentCsvDept = (await resolveStudentCsvDept(student)).toLowerCase();
      const subjectDept = (subject.dept || '').trim().toLowerCase();

      // 403 if outside student's scheme or dept
      if (studentScheme !== subjectScheme || (studentCsvDept && subjectDept && studentCsvDept !== subjectDept)) {
        return res.status(403).json({
          error: 'Access forbidden: this subject is outside your VTU scheme or department'
        });
      }
    }

    // Return id, program_no, title, description, source, runnable, language (NO test_cases)
    const [programs] = await db.query(`
      SELECT id, program_no, title, description, source, runnable, language
      FROM lab_programs
      WHERE subject_id = ?
      ORDER BY program_no ASC
    `, [subjectId]);

    res.json({
      subject,
      programs: programs || []
    });
  } catch (err) {
    console.error('Error fetching subject programs:', err);
    res.status(500).json({ error: 'Failed to fetch subject programs' });
  }
};

// POST /api/coding/electives/:subjectId
// Choose an elective subject
exports.chooseElective = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const userId = req.user?.id;

    const [sRows] = await db.query(
      'SELECT student_id, scheme, department, semester, usn FROM students WHERE user_id = ?',
      [userId]
    );
    if (!sRows || !sRows.length) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const student = sRows[0];

    // Verify subject exists, is an elective, and belongs to student's scheme and dept
    const [subRows] = await db.query(`
      SELECT s.*, sch.name AS scheme_name
      FROM subjects s
      JOIN schemes sch ON s.scheme_id = sch.id
      WHERE s.id = ?
    `, [subjectId]);

    if (!subRows || !subRows.length) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    const subject = subRows[0];

    if (subject.type !== 'elective') {
      return res.status(400).json({ error: 'Subject is not an elective' });
    }

    const studentScheme = (student.scheme || '').replace(/\D/g, '');
    const subjectScheme = (subject.scheme_name || '').replace(/\D/g, '');
    const studentCsvDept = (await resolveStudentCsvDept(student)).toLowerCase();
    const subjectDept = (subject.dept || '').trim().toLowerCase();

    if (studentScheme !== subjectScheme || (studentCsvDept && subjectDept && studentCsvDept !== subjectDept)) {
      return res.status(403).json({ error: 'Forbidden: elective is outside your scheme or department' });
    }

    if (subject.semester > (student.semester || 1)) {
      return res.status(403).json({ error: 'Forbidden: elective is for a higher semester' });
    }

    await db.query(`
      INSERT INTO student_subjects (student_id, subject_id)
      VALUES (?, ?)
      ON CONFLICT (student_id, subject_id) DO NOTHING
    `, [student.student_id, subjectId]);

    res.json({ success: true, message: 'Elective chosen successfully' });
  } catch (err) {
    console.error('Error choosing elective:', err);
    res.status(500).json({ error: 'Failed to choose elective' });
  }
};

// DELETE /api/coding/electives/:subjectId
// Drop a chosen elective subject
exports.dropElective = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const userId = req.user?.id;

    const [sRows] = await db.query(
      'SELECT student_id, scheme, department, semester FROM students WHERE user_id = ?',
      [userId]
    );
    if (!sRows || !sRows.length) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const student = sRows[0];

    await db.query(`
      DELETE FROM student_subjects
      WHERE student_id = ? AND subject_id = ?
    `, [student.student_id, subjectId]);

    res.json({ success: true, message: 'Elective dropped successfully' });
  } catch (err) {
    console.error('Error dropping elective:', err);
    res.status(500).json({ error: 'Failed to drop elective' });
  }
};

// POST /api/coding/curriculum/preview (HOD only)
// Validate CSV content and return preview
exports.previewCurriculumCsv = async (req, res) => {
  try {
    const { previewCsvContent } = require('../utils/csvLabImporter');
    let csvData = '';
    if (req.file) {
      csvData = req.file.buffer.toString('utf-8');
    } else if (req.body && req.body.csv_content) {
      csvData = req.body.csv_content;
    } else {
      return res.status(400).json({ error: 'Please upload a CSV file or provide csv_content' });
    }

    const preview = previewCsvContent(csvData);
    res.json(preview);
  } catch (err) {
    console.error('Error previewing curriculum CSV:', err);
    res.status(500).json({ error: err.message || 'Failed to preview CSV' });
  }
};

// POST /api/coding/curriculum/import (HOD only)
// Import CSV after confirmation
exports.importCurriculum = async (req, res) => {
  try {
    const { parseCsvString, validateRow, executeImport } = require('../utils/csvLabImporter');
    let csvData = '';
    if (req.file) {
      csvData = req.file.buffer.toString('utf-8');
    } else if (req.body && req.body.csv_content) {
      csvData = req.body.csv_content;
    } else {
      return res.status(400).json({ error: 'Please upload a CSV file or provide csv_content' });
    }

    const { headers, rows } = parseCsvString(csvData);
    const REQUIRED_COLS = ['scheme', 'dept', 'semester', 'subject_code', 'subject_name', 'subject_type', 'program_no', 'title', 'description', 'source_pdf'];
    const missingCols = REQUIRED_COLS.filter(c => !headers.includes(c));
    if (missingCols.length > 0) {
      return res.status(400).json({ error: `Missing columns: ${missingCols.join(', ')}` });
    }

    const validRows = [];
    const rejected = [];
    for (let i = 0; i < rows.length; i++) {
      const errs = validateRow(rows[i], i + 2);
      if (errs.length > 0) {
        rejected.push({ line: i + 2, errors: errs });
      } else {
        validRows.push(rows[i]);
      }
    }

    if (rejected.length > 0) {
      return res.status(400).json({
        error: 'Validation failed. Whole import rolled back.',
        rejectedCount: rejected.length,
        rejected
      });
    }

    const result = await executeImport(validRows, 'HOD CSV Admin Upload', req.user?.id || 0, req.ip);
    res.json({
      message: 'Curriculum imported successfully',
      summary: result.summary
    });
  } catch (err) {
    console.error('Error importing curriculum:', err);
    res.status(500).json({ error: err.message || 'Failed to import curriculum' });
  }
};

// GET /api/coding/dept-map
// Returns USN code to department mappings (e.g. CS -> CSE)
exports.getDeptMap = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT usn_code, dept FROM dept_map');
    const map = {};
    (rows || []).forEach(r => {
      map[r.usn_code.toUpperCase()] = r.dept;
    });
    res.json(map);
  } catch (err) {
    console.error('Error fetching dept map:', err);
    res.status(500).json({ error: 'Failed to fetch dept map' });
  }
};




