const db = require('../config/db');

// GET /api/ranks/leaderboard?subject=ADA
exports.getSubjectRanks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const requestedSubject = req.query.subject || '';

    // Fetch list of all available subjects from existing tests
    const [subjectRows] = await db.query(
      'SELECT DISTINCT subject FROM tests ORDER BY subject ASC'
    );
    let availableSubjects = subjectRows.map(r => r.subject);

    if (userRole === 'faculty') {
      const facultySubjectsSet = new Set();

      // 1. Get subject from faculty table
      const [facRows] = await db.query(
        'SELECT subject FROM faculty WHERE user_id = ?',
        [userId]
      );
      if (facRows && facRows[0] && facRows[0].subject) {
        facRows[0].subject.split(',').forEach(s => {
          if (s.trim()) facultySubjectsSet.add(s.trim());
        });
      }

      // 2. Get subjects from tests created by this faculty
      const [testRows] = await db.query(
        'SELECT DISTINCT subject FROM tests WHERE created_by = ?',
        [userId]
      );
      if (testRows && testRows.length) {
        testRows.forEach(r => {
          if (r.subject && r.subject.trim()) facultySubjectsSet.add(r.subject.trim());
        });
      }

      // 3. Fallback to token subject if available
      if (req.user.subject && req.user.subject.trim()) {
        facultySubjectsSet.add(req.user.subject.trim());
      }

      if (facultySubjectsSet.size > 0) {
        const facSubjectsArr = Array.from(facultySubjectsSet);
        const filtered = availableSubjects.filter(s =>
          facSubjectsArr.some(fs => fs.toLowerCase() === s.toLowerCase())
        );
        availableSubjects = filtered.length > 0 ? filtered : facSubjectsArr;
      }
    }

    const activeSubject = requestedSubject && availableSubjects.some(s => s.toLowerCase() === requestedSubject.toLowerCase())
      ? availableSubjects.find(s => s.toLowerCase() === requestedSubject.toLowerCase())
      : (availableSubjects[0] || 'ADA');

    // Get top 10 students for activeSubject ordered by total score & accuracy
    const [leaderboardRows] = await db.query(
      `SELECT 
         s.student_id,
         u.full_name,
         s.usn,
         s.department,
         s.semester,
         COUNT(ts.submission_id) AS tests_completed,
         SUM(ts.score) AS total_score,
         SUM((SELECT COUNT(*) FROM test_questions tq WHERE tq.test_id = ts.test_id)) AS total_possible_score,
         ROUND(
           (SUM(ts.score) * 100.0) / NULLIF(SUM((SELECT COUNT(*) FROM test_questions tq WHERE tq.test_id = ts.test_id)), 0),
           1
         ) AS avg_percentage
       FROM test_submissions ts
       JOIN tests t ON ts.test_id = t.test_id
       JOIN students s ON ts.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE LOWER(t.subject) = LOWER(?)
       GROUP BY s.student_id, u.full_name, s.usn, s.department, s.semester
       ORDER BY total_score DESC, avg_percentage DESC, tests_completed DESC
       LIMIT 10`,
      [activeSubject]
    );

    // Get current student's student_id
    const [studentRows] = await db.query(
      'SELECT student_id FROM students WHERE user_id = ?',
      [userId]
    );
    const myStudentId = studentRows[0]?.student_id || 0;

    // Get all ranked students for the subject to find my personal rank
    const [allRankedRows] = await db.query(
      `SELECT 
         s.student_id,
         SUM(ts.score) AS total_score,
         ROUND(
           (SUM(ts.score) * 100.0) / NULLIF(SUM((SELECT COUNT(*) FROM test_questions tq WHERE tq.test_id = ts.test_id)), 0),
           1
         ) AS avg_percentage
       FROM test_submissions ts
       JOIN tests t ON ts.test_id = t.test_id
       JOIN students s ON ts.student_id = s.student_id
       WHERE LOWER(t.subject) = LOWER(?)
       GROUP BY s.student_id
       ORDER BY total_score DESC, avg_percentage DESC`,
      [activeSubject]
    );

    let myRank = null;
    let myStats = null;
    allRankedRows.forEach((row, index) => {
      if (row.student_id === myStudentId) {
        myRank = index + 1;
        myStats = row;
      }
    });

    res.json({
      subject: activeSubject,
      availableSubjects,
      top10: leaderboardRows.map((row, idx) => ({
        rank: idx + 1,
        studentId: row.student_id,
        fullName: row.full_name,
        usn: row.usn,
        department: row.department,
        semester: row.semester,
        testsCompleted: Number(row.tests_completed),
        totalScore: Number(row.total_score),
        totalPossibleScore: Number(row.total_possible_score || 0),
        avgPercentage: Number(row.avg_percentage || 0)
      })),
      myRank,
      totalParticipants: allRankedRows.length
    });
  } catch (err) {
    console.error('Error fetching subject ranks:', err);
    res.status(500).json({ error: 'Failed to fetch subject rankings' });
  }
};

// GET /api/analytics/class-performance (HOD / Faculty)
exports.getClassPerformance = async (req, res) => {
  try {
    // Overall class performance statistics grouped by subject
    const [subjectStats] = await db.query(
      `SELECT 
         t.subject,
         COUNT(DISTINCT t.test_id) AS total_tests,
         COUNT(ts.submission_id) AS total_submissions,
         COUNT(DISTINCT ts.student_id) AS active_students,
         ROUND(AVG((ts.score * 100.0) / NULLIF((SELECT COUNT(*) FROM test_questions tq WHERE tq.test_id = ts.test_id), 0)), 1) AS avg_percentage,
         ROUND(
           (COUNT(CASE WHEN (ts.score * 100.0 / NULLIF((SELECT COUNT(*) FROM test_questions tq WHERE tq.test_id = ts.test_id), 0)) >= 40 THEN 1 END) * 100.0) / NULLIF(COUNT(ts.submission_id), 0),
           1
         ) AS pass_percentage
       FROM tests t
       LEFT JOIN test_submissions ts ON ts.test_id = t.test_id
       GROUP BY t.subject
       ORDER BY avg_percentage DESC`
    );

    // Class total metrics
    const [overallMetrics] = await db.query(
      `SELECT 
         COUNT(ts.submission_id) AS grand_total_submissions,
         COUNT(DISTINCT ts.student_id) AS grand_total_participants,
         ROUND(AVG((ts.score * 100.0) / NULLIF((SELECT COUNT(*) FROM test_questions tq WHERE tq.test_id = ts.test_id), 0)), 1) AS overall_avg_percentage
       FROM test_submissions ts`
    );

    // Top 3 Overall Class Toppers
    const [overallToppers] = await db.query(
      `SELECT 
         s.student_id,
         u.full_name,
         s.usn,
         s.department,
         s.semester,
         COUNT(ts.submission_id) AS total_tests_taken,
         SUM(ts.score) AS grand_total_score,
         ROUND(
           AVG((ts.score * 100.0) / NULLIF((SELECT COUNT(*) FROM test_questions tq WHERE tq.test_id = ts.test_id), 0)),
           1
         ) AS overall_percentage
       FROM test_submissions ts
       JOIN students s ON ts.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       GROUP BY s.student_id, u.full_name, s.usn, s.department, s.semester
       ORDER BY grand_total_score DESC, overall_percentage DESC
       LIMIT 5`
    );

    res.json({
      overall: overallMetrics[0] || {},
      subjects: subjectStats.map(s => ({
        subject: s.subject,
        totalTests: Number(s.total_tests),
        totalSubmissions: Number(s.total_submissions),
        activeStudents: Number(s.active_students),
        avgPercentage: Number(s.avg_percentage || 0),
        passPercentage: Number(s.pass_percentage || 0)
      })),
      classToppers: overallToppers.map((t, idx) => ({
        rank: idx + 1,
        fullName: t.full_name,
        usn: t.usn,
        department: t.department,
        semester: t.semester,
        totalTestsTaken: Number(t.total_tests_taken),
        grandTotalScore: Number(t.grand_total_score),
        overallPercentage: Number(t.overall_percentage || 0)
      }))
    });
  } catch (err) {
    console.error('Error fetching class performance:', err);
    res.status(500).json({ error: 'Failed to fetch class performance analytics' });
  }
};
