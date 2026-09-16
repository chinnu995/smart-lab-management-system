const db = require('../config/db');
const { executeCode, runTestCases } = require('../services/codeRunner');
const { generateTestQuestions } = require('../services/aiProvider');
const { PLACEMENT_PATTERNS } = require('../data/placementPatterns');

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
    
    const problems = (rows || []).map(r => {
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
        unlockStatus: `Unlocked • Week ${weekNum}`
      };
    });

    res.json(problems);
  } catch (err) {
    console.error('Error fetching problems:', err);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
};

function ensure5Cases(cases = []) {
  const list = [...(Array.isArray(cases) ? cases : [])];
  if (list.length >= 5) return list.slice(0, 5);

  const defaults = [
    { input: '10 20', output: '30', explanation: 'Test case 1 sample execution' },
    { input: '5 15', output: '20', explanation: 'Test case 2 sample execution' },
    { input: '0 0', output: '0', explanation: 'Test case 3 boundary check' },
    { input: '-5 5', output: '0', explanation: 'Test case 4 negative numbers' },
    { input: '100 200', output: '300', explanation: 'Test case 5 large input values' }
  ];

  while (list.length < 5) {
    const fallback = defaults[list.length] || {
      input: `Test Case ${list.length + 1} Input`,
      output: `Test Case ${list.length + 1} Output`,
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
    if (!rows.length) return res.status(404).json({ error: 'Problem not found' });

    const problem = rows[0];
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

    sampleCases = ensure5Cases(sampleCases);

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
    const [pRows] = await db.query('SELECT sample_cases FROM coding_challenges WHERE problem_id = ?', [problemId]);
    let sampleCases = [];
    if (pRows.length) {
      try { sampleCases = typeof pRows[0].sample_cases === 'string' ? JSON.parse(pRows[0].sample_cases) : pRows[0].sample_cases; } catch(e){}
    }

    sampleCases = ensure5Cases(sampleCases);

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
    const [pRows] = await db.query('SELECT sample_cases, hidden_cases FROM coding_challenges WHERE problem_id = ?', [problemId]);
    if (!pRows.length) return res.status(404).json({ error: 'Problem not found' });

    let sampleCases = [];
    let hiddenCases = [];
    try { sampleCases = typeof pRows[0].sample_cases === 'string' ? JSON.parse(pRows[0].sample_cases) : pRows[0].sample_cases; } catch(e){}
    try { hiddenCases = typeof pRows[0].hidden_cases === 'string' ? JSON.parse(pRows[0].hidden_cases) : pRows[0].hidden_cases; } catch(e){}

    const allCases = ensure5Cases([...sampleCases, ...hiddenCases]);
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

