const { generateTestQuestions } = require('../services/aiProvider');
const { getLocalQuestions } = require('../services/questionBank');
const db = require('../config/db');

// POST /api/tests/generate
exports.generateTest = async (req, res) => {
  try {
    const { subject, duration = 10 } = req.body;
    const createdBy = req.user.id;

    let questions;
    let source = 'ai';

    // Try Gemini AI first, fall back to local question bank
    try {
      const prompt = `Create exactly 10 multiple-choice questions for the subject "${subject}". Each question must have exactly four options labeled a, b, c, d, and indicate the correct option. Return ONLY a JSON array (no markdown, no explanation) with objects like: [{"question":"...","options":{"a":"...","b":"...","c":"...","d":"..."},"answer":"a"}]`;
      questions = await generateTestQuestions(prompt);
      console.log(`✓ Generated ${questions.length} questions via Gemini AI for ${subject}`);
    } catch (aiErr) {
      console.warn(`⚠ Gemini AI failed (${aiErr.message}), falling back to local question bank`);
      questions = getLocalQuestions(subject);
      source = 'local';
      console.log(`✓ Loaded ${questions.length} questions from local bank for ${subject}`);
    }

    // Insert test record
    const [testResult] = await db.query(
      'INSERT INTO tests (subject, created_by, duration_minutes) VALUES (?,?,?)',
      [subject, createdBy, duration]
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
    const annTitle = `New MCQ Test Scheduled: ${subject}`;
    const annContent = `A new MCQ test on the subject "${subject}" has been generated and is now active. Duration: ${duration} minutes. Please check your "My Tests" section to complete the test before it closes.`;
    const [annResult] = await db.query(
      `INSERT INTO announcements (title, content, category, posted_by, target_role, is_pinned)
       VALUES (?,?,?,?,?,?)`,
      [annTitle, annContent, 'exam', createdBy, 'student', 0]
    );

    // Notify students via websocket in real-time
    const io = req.app?.get('io');
    if (io) {
      io.to('role:student').emit('announcement:new', {
        id: annResult.insertId,
        title: annTitle,
        category: 'exam'
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
      SELECT t.test_id, t.subject, t.duration_minutes, t.status, t.created_at,
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
      GROUP BY t.test_id
      ORDER BY t.created_at DESC
    `;
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch created tests' });
  }
};

// GET /api/tests/active/:studentId — list tests not yet submitted by the student
exports.listActiveTests = async (req, res) => {
  try {
    const userId = req.params.studentId;
    // Resolve actual student_id from user_id
    const [studentRows] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
    const studentId = studentRows[0]?.student_id || 0;

    // Use LEFT JOIN to find tests where the student has NOT yet submitted
    const [rows] = await db.query(
      `SELECT t.test_id, t.subject, t.duration_minutes, t.created_at
       FROM tests t
       LEFT JOIN test_submissions ts ON ts.test_id = t.test_id AND ts.student_id = ?
       WHERE t.status = 'active' AND ts.submission_id IS NULL
       ORDER BY t.created_at DESC`,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
};

// GET /api/tests/:testId — retrieve test with questions (no correct answers sent to client)
exports.getTestDetails = async (req, res) => {
  try {
    const testId = req.params.testId;
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
    const formatted = questions.map(q => ({
      questionId: q.question_id,
      question: q.question_text,
      options: { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d }
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

    // Resolve actual student_id from user_id
    const [studentRows] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
    if (!studentRows.length) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const studentId = studentRows[0].student_id;

    // Check if already submitted
    const [existing] = await db.query(
      'SELECT submission_id FROM test_submissions WHERE test_id = ? AND student_id = ?',
      [testId, studentId]
    );
    if (existing.length) {
      return res.status(400).json({ error: 'Test already submitted' });
    }

    // Fetch correct answers
    const [questions] = await db.query(
      'SELECT question_id, correct_option FROM test_questions WHERE test_id = ?',
      [testId]
    );
    const correctMap = {};
    questions.forEach(q => { correctMap[q.question_id] = q.correct_option; });

    let score = 0;
    (answers || []).forEach(a => {
      if (correctMap[a.questionId] === a.selectedOption) score++;
    });

    await db.query(
      'INSERT INTO test_submissions (test_id, student_id, answers_json, score) VALUES (?,?,?,?)',
      [testId, studentId, JSON.stringify(answers), score]
    );
    res.json({ score, total: questions.length, message: 'Test submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit test' });
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

