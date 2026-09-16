const { generateTestQuestions, generateTestFeedback } = require('../services/aiProvider');
const { getLocalQuestions } = require('../services/questionBank');
const db = require('../config/db');
const audit = require('../utils/audit');

// POST /api/tests/generate
exports.generateTest = async (req, res) => {
  try {
    const { subject, duration = 10 } = req.body;
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    const cleanSubject = subject.trim();
    const createdBy = req.user.id;

    let questions;
    let source = 'ai';

    // Try Gemini AI first, fall back to local VTU question bank
    try {
      const prompt = `Create exactly 10 official VTU syllabus multiple-choice questions for the university course "${cleanSubject}" aligned with VTU module topics. Ensure questions and options are randomized. Each question must have four options labeled a, b, c, d, and indicate the correct option. Return ONLY a JSON array (no markdown, no explanation) with objects like: [{"question":"...","options":{"a":"...","b":"...","c":"...","d":"..."},"answer":"a"}]`;
      questions = await generateTestQuestions(prompt);
      console.log(`✓ Generated ${questions.length} VTU syllabus questions via Gemini AI for ${cleanSubject}`);
    } catch (aiErr) {
      console.warn(`⚠ Gemini AI failed (${aiErr.message}), falling back to local VTU question bank`);
      questions = getLocalQuestions(cleanSubject);
      source = 'local';
      console.log(`✓ Loaded ${questions.length} VTU syllabus questions from local bank for ${cleanSubject}`);
    }

    // Normalize, sanitize, and shuffle questions & option choices (Fisher-Yates)
    const { fisherYatesShuffle } = require('../services/questionBank');
    
    questions = fisherYatesShuffle(questions || []).map((q, idx) => {
      const opts = q.options || {};
      let ans = (q.answer || q.correct || q.correct_option || 'a').toString().toLowerCase().trim();
      if (!['a', 'b', 'c', 'd'].includes(ans)) ans = 'a';

      const origOpts = [
        { key: 'a', text: String(opts.a || opts.A || q.option_a || 'Option A') },
        { key: 'b', text: String(opts.b || opts.B || q.option_b || 'Option B') },
        { key: 'c', text: String(opts.c || opts.C || q.option_c || 'Option C') },
        { key: 'd', text: String(opts.d || opts.D || q.option_d || 'Option D') }
      ];
      const shuffledOpts = fisherYatesShuffle(origOpts);

      const keys = ['a', 'b', 'c', 'd'];
      const options = {};
      let newAns = 'a';

      shuffledOpts.forEach((opt, i) => {
        const displayKey = keys[i];
        options[displayKey] = opt.text;
        if (opt.key === ans) newAns = displayKey;
      });

      return {
        question: q.question || `VTU Question ${idx + 1} on ${cleanSubject}`,
        options,
        answer: newAns
      };
    });

    // Insert test record
    const [testResult] = await db.query(
      'INSERT INTO tests (subject, created_by, duration_minutes) VALUES (?,?,?)',
      [cleanSubject, createdBy, duration]
    );
    const testId = testResult.insertId;

    // Insert questions
    const qInserts = questions.map(q => [
      testId, q.question,
      q.options.a, q.options.b, q.options.c, q.options.d,
      q.answer
    ]);
    await db.query(
      'INSERT INTO test_questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES ?',
      [qInserts]
    );

    // Insert auto-generated announcement for students
    const annTitle = `New VTU MCQ Test Scheduled: ${cleanSubject}`;
    const annContent = `A new VTU syllabus MCQ test on "${cleanSubject}" has been generated and is now active. Duration: ${duration} minutes. Check "MCQ Tests" in your menu to complete.`;
    const [annResult] = await db.query(
      `INSERT INTO announcements (title, content, category, posted_by, target_role, is_pinned)
       VALUES (?,?,?,?,?,?)`,
      [annTitle, annContent, 'exam', createdBy, 'student', 1]
    );

    // Insert notifications into notifications table for all student users
    const [studentUsers] = await db.query("SELECT user_id FROM users WHERE role = 'student'").catch(() => [[]]);
    for (const stu of studentUsers || []) {
      await db.query(
        'INSERT INTO notifications (user_id, type, title, message) VALUES (?,?,?,?)',
        [stu.user_id, 'exam', annTitle, annContent]
      ).catch(() => {});
    }

    // Notify students via websocket in real-time
    const io = req.app?.get('io');
    if (io) {
      io.to('role:student').emit('announcement:new', {
        id: annResult.insertId,
        title: annTitle,
        category: 'exam'
      });
      io.to('role:student').emit('notification', {
        title: annTitle,
        message: annContent,
        type: 'exam'
      });
      io.to('role:student').emit('mcq-test:new', {
        testId,
        subject: cleanSubject,
        duration,
        title: annTitle,
        message: annContent
      });
    }

    res.status(201).json({
      testId, subject, duration, source,
      questionCount: questions.length,
      message: source === 'ai'
        ? 'Test generated successfully via AI'
        : 'Test generated from question bank (AI unavailable)'
    });
  } catch (err) {
    console.error('Error generating test:', err);
    res.status(500).json({ error: 'Failed to generate test', details: err.message });
  }
};

// GET /api/tests/created — list tests (all for HOD, created by user for faculty)
exports.listCreatedTests = async (req, res) => {
  try {
    const userId = req.user.id;
    const isHod = req.user.role === 'hod';
    
    let query = `
      SELECT t.test_id, t.subject, t.duration_minutes, COALESCE(t.test_type, 'mcq') AS test_type, t.status, t.created_at,
             u.full_name AS creator_name,
             COUNT(tq.question_id) AS question_count,
             (SELECT COUNT(*) FROM test_submissions ts WHERE ts.test_id = t.test_id) AS submission_count
      FROM tests t
      LEFT JOIN test_questions tq ON tq.test_id = t.test_id
      JOIN users u ON u.user_id = t.created_by
    `;
    
    const params = [];
    if (!isHod) {
      query += ` WHERE t.created_by = ?`;
      params.push(userId);
    }
    
    query += `
      GROUP BY t.test_id, u.full_name, t.subject, t.duration_minutes, t.test_type, t.status, t.created_at
      ORDER BY t.created_at DESC
    `;
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch created tests' });
  }
};

// GET /api/tests/active/:studentId — list tests not yet submitted by the student (deduplicated by subject & type)
exports.listActiveTests = async (req, res) => {
  try {
    const paramId = req.params.studentId;
    const userId = (paramId && paramId !== 'undefined' && paramId !== 'null' && paramId !== 'me') 
      ? paramId 
      : (req.user ? req.user.id : 0);

    // Resolve actual student_id from user_id
    const [studentRows] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
    const studentId = studentRows[0]?.student_id || 0;

    // Use LEFT JOIN to find tests where the student has NOT yet submitted
    const [rows] = await db.query(
      `SELECT t.test_id, t.subject, t.duration_minutes, COALESCE(t.test_type, 'mcq') AS test_type, t.created_at
       FROM tests t
       LEFT JOIN test_submissions ts ON ts.test_id = t.test_id AND ts.student_id = ?
       WHERE t.status = 'active' AND ts.submission_id IS NULL
       ORDER BY t.created_at DESC`,
      [studentId]
    );

    // Deduplicate to show only the 1 latest test per subject & type
    const seenMap = new Map();
    const deduplicated = [];

    for (const test of rows) {
      const key = `${test.subject.toUpperCase().trim()}_${test.test_type}`;
      if (!seenMap.has(key)) {
        seenMap.set(key, true);
        deduplicated.push(test);
      }
    }

    res.json(deduplicated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
};

// Seeded Pseudo-Random Number Generator (Mulberry32)
function getPRNG(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  let a = h >>> 0;
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArray(array, rng) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Shuffles both the order of questions AND option choices (a, b, c, d) deterministically per student & test
function getStudentShuffledQuestions(questions, userId, testId) {
  const keys = ['a', 'b', 'c', 'd'];
  // 1. Shuffle question list order using student + test seed
  const qRng = getPRNG(`user_${userId}_test_${testId}_qorder`);
  const shuffledQuestions = shuffleArray(questions, qRng);

  // 2. For each question, shuffle options using student + test + question seed
  return shuffledQuestions.map(q => {
    const optRng = getPRNG(`user_${userId}_test_${testId}_q_${q.question_id}_options`);
    const origOpts = [
      { origKey: 'a', text: q.option_a },
      { origKey: 'b', text: q.option_b },
      { origKey: 'c', text: q.option_c },
      { origKey: 'd', text: q.option_d }
    ];
    const shuffledOpts = shuffleArray(origOpts, optRng);

    const options = {};
    let studentCorrectOption = null;

    shuffledOpts.forEach((opt, idx) => {
      const displayKey = keys[idx];
      options[displayKey] = opt.text;
      if (q.correct_option && opt.origKey === q.correct_option) {
        studentCorrectOption = displayKey;
      }
    });

    return {
      questionId: q.question_id,
      question: q.question_text,
      options,
      correctOption: studentCorrectOption
    };
  });
}

// GET /api/tests/:testId — retrieve test with questions (no correct answers sent to client)
exports.getTestDetails = async (req, res) => {
  try {
    const testId = req.params.testId;
    const userId = req.user ? req.user.id : 0;

    const [testRows] = await db.query(
      'SELECT test_id, subject, duration_minutes, created_at FROM tests WHERE test_id = ?',
      [testId]
    );
    if (!testRows.length) return res.status(404).json({ error: 'Test not found' });
    const test = testRows[0];
    const [questions] = await db.query(
      'SELECT question_id, question_text, option_a, option_b, option_c, option_d FROM test_questions WHERE test_id = ?',
      [testId]
    );

    const studentQuestions = getStudentShuffledQuestions(questions, userId, testId);
    const formatted = studentQuestions.map(q => ({
      questionId: q.questionId,
      question: q.question,
      options: q.options
    }));

    res.json({
      testId: test.test_id,
      subject: test.subject,
      duration: test.duration_minutes,
      questions: formatted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
};

// POST /api/tests/:testId/submit
exports.submitTest = async (req, res) => {
  try {
    const testId = req.params.testId;
    const userId = req.user.id;
    const { answers } = req.body; // [{questionId, selectedOption}]

    const [studentRows] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
    if (!studentRows.length) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const studentId = studentRows[0].student_id;

    // Check if already submitted (if existing, update submission)
    const [existing] = await db.query(
      'SELECT submission_id FROM test_submissions WHERE test_id = ? AND student_id = ?',
      [testId, studentId]
    );

    // Fetch test & full questions list
    const [testRows] = await db.query('SELECT subject FROM tests WHERE test_id = ?', [testId]);
    const subject = testRows[0]?.subject || 'MCQ Test';

    const [questions] = await db.query(
      'SELECT question_id, question_text, option_a, option_b, option_c, option_d, correct_option FROM test_questions WHERE test_id = ?',
      [testId]
    );

    const userAnsMap = {};
    (answers || []).forEach(a => { userAnsMap[a.questionId] = a.selectedOption; });

    // Compute student-specific shuffled question order and option keys
    const studentQuestions = getStudentShuffledQuestions(questions, userId, testId);

    let score = 0;
    const review = [];
    const incorrectQuestions = [];

    studentQuestions.forEach(sq => {
      const selected = userAnsMap[sq.questionId] || null;
      const correct = sq.correctOption;
      const isCorrect = selected === correct;
      if (isCorrect) score++;
      else incorrectQuestions.push({ question: sq.question, selected, correct });

      review.push({
        questionId: sq.questionId,
        question: sq.question,
        options: sq.options,
        selectedOption: selected,
        correctOption: correct,
        isCorrect
      });
    });

    if (existing.length) {
      await db.query(
        'UPDATE test_submissions SET answers_json = ?, score = ?, submitted_at = CURRENT_TIMESTAMP WHERE submission_id = ?',
        [JSON.stringify(answers), score, existing[0].submission_id]
      );
    } else {
      await db.query(
        'INSERT INTO test_submissions (test_id, student_id, answers_json, score) VALUES (?,?,?,?)',
        [testId, studentId, JSON.stringify(answers), score]
      );
    }

    // Generate AI improvement feedback
    const aiFeedback = await generateTestFeedback(subject, score, questions.length, incorrectQuestions);

    res.json({
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      subject,
      review,
      aiFeedback,
      message: 'Test submitted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit test' });
  }
};

// GET /api/tests/:testId/my-result — fetch student submission result, answer key, and AI suggestions
exports.getMyTestResult = async (req, res) => {
  try {
    const testId = req.params.testId;
    const userId = req.user.id;

    const [studentRows] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
    if (!studentRows.length) return res.status(404).json({ error: 'Student profile not found' });
    const studentId = studentRows[0].student_id;

    const [submissionRows] = await db.query(
      'SELECT score, answers_json, submitted_at FROM test_submissions WHERE test_id = ? AND student_id = ?',
      [testId, studentId]
    );
    if (!submissionRows.length) return res.status(404).json({ error: 'No submission found for this test' });

    const submission = submissionRows[0];
    let userAns = [];
    try { userAns = JSON.parse(submission.answers_json); } catch (e) {}

    const [testRows] = await db.query('SELECT subject FROM tests WHERE test_id = ?', [testId]);
    const subject = testRows[0]?.subject || 'MCQ Test';

    const [questions] = await db.query(
      'SELECT question_id, question_text, option_a, option_b, option_c, option_d, correct_option FROM test_questions WHERE test_id = ?',
      [testId]
    );

    const userAnsMap = {};
    (userAns || []).forEach(a => { userAnsMap[a.questionId] = a.selectedOption; });

    const studentQuestions = getStudentShuffledQuestions(questions, userId, testId);

    let score = submission.score;
    const review = [];
    const incorrectQuestions = [];

    studentQuestions.forEach(sq => {
      const selected = userAnsMap[sq.questionId] || null;
      const correct = sq.correctOption;
      const isCorrect = selected === correct;
      if (!isCorrect) incorrectQuestions.push({ question: sq.question, selected, correct });

      review.push({
        questionId: sq.questionId,
        question: sq.question,
        options: sq.options,
        selectedOption: selected,
        correctOption: correct,
        isCorrect
      });
    });

    const aiFeedback = await generateTestFeedback(subject, score, questions.length, incorrectQuestions);

    res.json({
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      subject,
      submittedAt: submission.submitted_at,
      review,
      aiFeedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch test result' });
  }
};

// GET /api/tests/:testId/submissions — list student submissions for a test (HOD/faculty only)
exports.getTestSubmissions = async (req, res) => {
  try {
    const testId = req.params.testId;
    const [rows] = await db.query(
      `SELECT ts.submission_id, ts.score, ts.submitted_at, ts.answers_json,
              u.full_name, s.usn, s.department, s.semester, s.section,
              (SELECT COUNT(*) FROM test_questions tq WHERE tq.test_id = ts.test_id) AS total_questions
       FROM test_submissions ts
       JOIN students s ON ts.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE ts.test_id = ?
       ORDER BY ts.submitted_at DESC`,
      [testId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch test submissions' });
  }
};

// POST /api/tests/malpractice-log — record malpractice violation and alert faculty & HOD
exports.logMalpractice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { testId, problemId, testType, subject, reason, warningCount } = req.body;

    // Fetch student details
    const [studentRows] = await db.query(
      `SELECT s.student_id, s.usn, s.department, s.section, u.full_name
       FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.user_id = ?`,
      [userId]
    );
    if (!studentRows.length) return res.status(404).json({ error: 'Student profile not found' });
    const student = studentRows[0];

    const testSubject = subject || 'Subject Test';
    const violationReason = reason || 'Tab Switch / Exited Fullscreen Mode';

    // Find faculty assigned to subject and HOD users
    const [facultyRows] = await db.query(
      `SELECT u.user_id, u.full_name, u.role FROM users u
       LEFT JOIN faculty f ON f.user_id = u.user_id
       WHERE u.role = 'hod' OR (u.role = 'faculty' AND (f.subject = ? OR f.subject IS NULL))`,
      [testSubject]
    );

    const alertTitle = `🚨 MALPRACTICE ALERT: ${student.full_name} (${student.usn})`;
    const alertMsg = `Student ${student.full_name} (${student.usn}, Dept: ${student.department || 'CSE'}) triggered a malpractice warning (${violationReason}) during ${testSubject} test. Warning #${warningCount || 1} of 3.`;

    // Insert notifications for faculty & HOD
    for (const f of facultyRows) {
      await db.query(
        'INSERT INTO notifications (user_id, type, title, message) VALUES (?,?,?,?)',
        [f.user_id, 'malpractice', alertTitle, alertMsg]
      );
    }

    // Log to audit table
    await audit.log(userId, 'MALPRACTICE_WARNING', 'test_submissions', testId || problemId || 0, alertMsg, req.ip);

    // Real-time broadcast to faculty & HOD sockets
    const io = req.app.get('io');
    if (io) {
      const alertData = {
        studentId: student.student_id,
        studentName: student.full_name,
        usn: student.usn,
        department: student.department || 'CSE',
        subject: testSubject,
        reason: violationReason,
        warningCount: warningCount || 1,
        timestamp: new Date().toISOString()
      };
      io.to('role:faculty').emit('malpractice:alert', alertData);
      io.to('role:hod').emit('malpractice:alert', alertData);
    }

    res.json({ message: 'Malpractice logged and reported to faculty', warningCount });
  } catch (err) {
    console.error('Error logging malpractice:', err);
    res.status(500).json({ error: 'Failed to log malpractice' });
  }
};

// POST /api/tests/generate-coding — Generate Proctored Coding Lab Test
exports.generateCodingTest = async (req, res) => {
  try {
    const { subject, duration = 60 } = req.body;
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    const cleanSubject = subject.trim();
    const createdBy = req.user.id;

    // 1. Prioritize official conducted Lab Programs for this subject (VTU ADA Lab 1 to 10, VTU DSA Lab 1 to 12, etc.)
    let [problems] = await db.query(
      `SELECT problem_id, title, week_number FROM coding_challenges 
       WHERE UPPER(category) = UPPER(?) 
         AND (LOWER(title) LIKE '%lab%' OR LOWER(title) LIKE '%vtu%')
       ORDER BY week_number ASC, problem_id ASC LIMIT 10`,
      [cleanSubject]
    );

    // 2. If fewer than 10 official lab programs found, fall back to general category problems
    if (!problems || problems.length < 10) {
      const existingIds = (problems || []).map(p => p.problem_id);
      let query = `SELECT problem_id, title FROM coding_challenges WHERE UPPER(category) = UPPER(?)`;
      const params = [cleanSubject];
      if (existingIds.length) {
        query += ` AND problem_id NOT IN (?)`;
        params.push(existingIds);
      }
      query += ` ORDER BY problem_id ASC LIMIT ?`;
      params.push(10 - existingIds.length);

      const [extra] = await db.query(query, params).catch(() => [[]]);
      problems = [...(problems || []), ...(extra || [])];
    }

    if (!problems.length) {
      return res.status(400).json({ error: 'No coding challenges available for this subject' });
    }

    // Close previous active coding tests for this subject
    await db.query(
      "UPDATE tests SET status = 'completed' WHERE UPPER(subject) = UPPER(?) AND COALESCE(test_type, 'mcq') = 'coding'",
      [cleanSubject]
    ).catch(() => {});

    // Insert coding test record
    const [testResult] = await db.query(
      'INSERT INTO tests (subject, created_by, duration_minutes, test_type) VALUES (?,?,?,?)',
      [cleanSubject, createdBy, duration, 'coding']
    );
    const testId = testResult.insertId;

    // Insert test questions linking to problem_id
    const qInserts = problems.map((p, idx) => [
      testId,
      p.title || `Coding Challenge #${idx + 1}`,
      'N/A', 'N/A', 'N/A', 'N/A', 'a',
      p.problem_id
    ]);

    await db.query(
      'INSERT INTO test_questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, problem_id) VALUES ?',
      [qInserts]
    );

    // Auto-generate announcement for students
    const annTitle = `🚨 New Proctored Coding Lab Test: ${cleanSubject}`;
    const annContent = `A new Proctored Coding Lab Test on "${cleanSubject}" has been created by your subject faculty. Each student is assigned 1 coding problem with full tab switch security. Duration: ${duration} minutes. Check "Coding Lab Tests" in your menu to complete.`;
    
    const [annResult] = await db.query(
      `INSERT INTO announcements (title, content, category, posted_by, target_role, is_pinned)
       VALUES (?,?,?,?,?,?)`,
      [annTitle, annContent, 'exam', createdBy, 'student', 1]
    );

    // Insert notifications into notifications table for all student users
    const [studentUsers] = await db.query("SELECT user_id FROM users WHERE role = 'student'").catch(() => [[]]);
    for (const stu of studentUsers || []) {
      await db.query(
        'INSERT INTO notifications (user_id, type, title, message) VALUES (?,?,?,?)',
        [stu.user_id, 'exam', annTitle, annContent]
      ).catch(() => {});
    }

    const io = req.app?.get('io');
    if (io) {
      io.to('role:student').emit('announcement:new', {
        id: annResult.insertId,
        title: annTitle,
        category: 'exam'
      });
      io.to('role:student').emit('coding-test:new', {
        testId,
        subject: cleanSubject,
        duration,
        title: annTitle,
        message: annContent
      });
    }

    res.status(201).json({
      testId,
      subject: cleanSubject,
      duration,
      testType: 'coding',
      questionCount: problems.length,
      message: `Proctored Coding Lab Test created with ${problems.length} problem pool`
    });
  } catch (err) {
    console.error('Error generating coding test:', err);
    res.status(500).json({ error: 'Failed to generate coding test', details: err.message });
  }
};

// GET /api/tests/coding/:testId — retrieve assigned problem for a student (1 problem assigned per student with batch shuffling)
exports.getCodingTestDetails = async (req, res) => {
  try {
    const testId = req.params.testId;
    const userId = req.user.id;

    // Fetch test details
    const [testRows] = await db.query(
      'SELECT test_id, subject, duration_minutes, COALESCE(test_type, \'coding\') AS test_type, created_at FROM tests WHERE test_id = ?',
      [testId]
    );
    if (!testRows.length) return res.status(404).json({ error: 'Test not found' });
    const test = testRows[0];

    // Check if student profile exists
    const [studentRows] = await db.query(
      `SELECT s.student_id, s.usn, s.department, s.section, u.full_name
       FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.user_id = ?`,
      [userId]
    );
    const student = studentRows[0] || { student_id: userId, usn: `STU${userId}` };

    // Check if student has already submitted
    const [existingSub] = await db.query(
      'SELECT submission_id, score, answers_json, submitted_at FROM test_submissions WHERE test_id = ? AND student_id = ?',
      [testId, student.student_id]
    );
    const isSubmitted = existingSub.length > 0;
    let userSubmission = null;
    if (isSubmitted) {
      try { userSubmission = JSON.parse(existingSub[0].answers_json); } catch (e) {}
    }

    // Fetch all problems in the pool for this test
    const [qRows] = await db.query(
      `SELECT tq.question_id, tq.problem_id, cc.title, cc.difficulty, cc.category, cc.description, cc.input_format, cc.output_format, cc.constraints, cc.sample_cases, cc.starter_code
       FROM test_questions tq
       JOIN coding_challenges cc ON tq.problem_id = cc.problem_id
       WHERE tq.test_id = ?
       ORDER BY tq.question_id ASC`,
      [testId]
    );

    if (!qRows.length) {
      return res.status(404).json({ error: 'No coding problems found for this test' });
    }

    // Calculate student rank index across all students
    const [allStudents] = await db.query('SELECT student_id FROM students ORDER BY student_id ASC');
    let studentIndex = allStudents.findIndex(s => s.student_id === student.student_id);
    if (studentIndex < 0) studentIndex = (userId || 1) - 1;

    // Batch calculation: 10 students per batch
    const poolSize = qRows.length;
    const batchIndex = Math.floor(studentIndex / 10);
    const positionInBatch = studentIndex % 10;

    // Deterministic shuffle using testId + batchIndex seed
    const batchRng = getPRNG(`test_${testId}_batch_${batchIndex}`);
    const shuffledPool = shuffleArray(qRows, batchRng);

    const assignedProblem = shuffledPool[positionInBatch % poolSize];

    res.json({
      testId: test.test_id,
      subject: test.subject,
      duration: test.duration_minutes,
      testType: test.test_type || 'coding',
      batchIndex: batchIndex + 1,
      questionNumberInBatch: positionInBatch + 1,
      totalInPool: poolSize,
      assignedProblem,
      isSubmitted,
      userSubmission
    });
  } catch (err) {
    console.error('Error fetching coding test details:', err);
    res.status(500).json({ error: 'Failed to fetch coding test details' });
  }
};

// POST /api/tests/coding/:testId/submit — Submit solution for assigned coding test
exports.submitCodingTest = async (req, res) => {
  try {
    const testId = req.params.testId;
    const userId = req.user.id;
    const { problemId, language, code } = req.body;

    const { runTestCases } = require('../services/codeRunner');

    const [studentRows] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
    if (!studentRows.length) return res.status(404).json({ error: 'Student profile not found' });
    const studentId = studentRows[0].student_id;

    // Fetch problem details & hidden test cases
    const [pRows] = await db.query(
      'SELECT sample_cases, hidden_cases FROM coding_challenges WHERE problem_id = ?',
      [problemId]
    );
    if (!pRows.length) return res.status(404).json({ error: 'Problem not found' });

    let sampleCases = [], hiddenCases = [];
    try { sampleCases = typeof pRows[0].sample_cases === 'string' ? JSON.parse(pRows[0].sample_cases) : pRows[0].sample_cases || []; } catch (e) {}
    try { hiddenCases = typeof pRows[0].hidden_cases === 'string' ? JSON.parse(pRows[0].hidden_cases) : pRows[0].hidden_cases || []; } catch (e) {}

    const allCases = [...sampleCases, ...hiddenCases];

    // Evaluate code
    const evalResult = await runTestCases(code, language, allCases);

    const score = evalResult.allPassed ? 100 : Math.round((evalResult.passedCount / (evalResult.totalCount || 1)) * 100);
    const answersPayload = {
      problemId,
      language,
      code,
      passedCount: evalResult.passedCount,
      totalCount: evalResult.totalCount,
      status: evalResult.status,
      submittedAt: new Date().toISOString()
    };

    // Upsert into test_submissions
    const [existing] = await db.query(
      'SELECT submission_id FROM test_submissions WHERE test_id = ? AND student_id = ?',
      [testId, studentId]
    );

    if (existing.length) {
      await db.query(
        'UPDATE test_submissions SET answers_json = ?, score = ?, submitted_at = CURRENT_TIMESTAMP WHERE submission_id = ?',
        [JSON.stringify(answersPayload), score, existing[0].submission_id]
      );
    } else {
      await db.query(
        'INSERT INTO test_submissions (test_id, student_id, answers_json, score) VALUES (?,?,?,?)',
        [testId, studentId, JSON.stringify(answersPayload), score]
      );
    }

    // Also record in coding_submissions
    await db.query(
      `INSERT INTO coding_submissions (problem_id, student_id, language, code, status, passed_cases, total_cases, score)
       VALUES (?,?,?,?,?,?,?,?)`,
      [problemId, studentId, language, code, evalResult.status || 'Submitted', evalResult.passedCount, evalResult.totalCount, score]
    ).catch(() => {});

    res.json({
      message: 'Coding Lab Test solution submitted successfully!',
      score,
      allPassed: evalResult.allPassed,
      status: evalResult.status,
      passedCount: evalResult.passedCount,
      totalCount: evalResult.totalCount,
      results: evalResult.results
    });
  } catch (err) {
    console.error('Error submitting coding test:', err);
    res.status(500).json({ error: 'Failed to submit coding test' });
  }
};
