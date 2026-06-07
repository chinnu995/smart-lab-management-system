const db = require('../config/db');
const bcrypt = require('bcryptjs');
const audit = require('../utils/audit');

exports.list = async (req, res) => {
  const search = `%${req.query.q || ''}%`;
  const [rows] = await db.execute(
    `SELECT s.student_id, s.usn, u.full_name, u.email, u.phone, s.department, s.semester, s.section
       FROM students s JOIN users u ON u.user_id = s.user_id
       WHERE u.full_name LIKE ? OR s.usn LIKE ? OR u.email LIKE ?
       ORDER BY s.student_id DESC`, [search, search, search]
  );
  res.json(rows);
};

exports.get = async (req, res) => {
  const [rows] = await db.execute(
    `SELECT s.*, u.full_name, u.email, u.phone FROM students s
       JOIN users u ON u.user_id = s.user_id WHERE s.student_id=?`, [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
};

exports.create = async (req, res) => {
  const { full_name, email, password, phone, usn, department, semester, section, batch_year } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(password || 'password123', 10);
    const [u] = await conn.execute(
      'INSERT INTO users (full_name,email,password_hash,role,phone) VALUES (?,?,?,?,?)',
      [full_name, email, hash, 'student', phone || null]
    );
    const [s] = await conn.execute(
      'INSERT INTO students (user_id,usn,department,semester,section,batch_year) VALUES (?,?,?,?,?,?)',
      [u.insertId, usn, department, semester, section || null, batch_year || null]
    );
    await conn.commit();
    audit.log(req.user.id, 'CREATE_STUDENT', 'students', s.insertId, `Created ${usn}`, req.ip);
    res.status(201).json({ student_id: s.insertId, user_id: u.insertId });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ message: e.message });
  } finally { conn.release(); }
};

exports.update = async (req, res) => {
  const { full_name, phone, department, semester, section } = req.body;
  const [s] = await db.execute('SELECT user_id FROM students WHERE student_id=?', [req.params.id]);
  if (!s.length) return res.status(404).json({ message: 'Not found' });
  await db.execute('UPDATE users SET full_name=COALESCE(?,full_name), phone=COALESCE(?,phone) WHERE user_id=?',
    [full_name, phone, s[0].user_id]);
  await db.execute(
    'UPDATE students SET department=COALESCE(?,department), semester=COALESCE(?,semester), section=COALESCE(?,section) WHERE student_id=?',
    [department, semester, section, req.params.id]
  );
  audit.log(req.user.id, 'UPDATE_STUDENT', 'students', req.params.id, 'Updated student', req.ip);
  res.json({ message: 'Updated' });
};

exports.remove = async (req, res) => {
  const [s] = await db.execute('SELECT user_id FROM students WHERE student_id=?', [req.params.id]);
  if (!s.length) return res.status(404).json({ message: 'Not found' });
  await db.execute('DELETE FROM users WHERE user_id=?', [s[0].user_id]);
  audit.log(req.user.id, 'DELETE_STUDENT', 'students', req.params.id, 'Deleted student', req.ip);
  res.json({ message: 'Deleted' });
};

exports.attendanceSummary = async (req, res) => {
  // returns per-lab attendance % for a student
  let studentId = req.params.id;
  let usn = '';
  if (req.user.role === 'student') {
    const [m] = await db.execute('SELECT student_id, usn FROM students WHERE user_id=?', [req.user.id]);
    studentId = m[0]?.student_id;
    usn = m[0]?.usn;
  } else {
    const [m] = await db.execute('SELECT usn FROM students WHERE student_id=?', [studentId]);
    if (m.length) usn = m[0].usn;
  }
  const [rows] = await db.execute(
    `SELECT l.lab_name,
            COUNT(*) AS total,
            SUM(a.status='present') AS present,
            ROUND(SUM(a.status='present')*100/COUNT(*),2) AS percentage
       FROM attendance a JOIN labs l ON l.lab_id=a.lab_id
      WHERE a.student_id=? GROUP BY l.lab_id`, [studentId]
  );
  const [overall] = await db.execute(
    `SELECT ROUND(SUM(status='present')*100/COUNT(*),2) AS overall
       FROM attendance WHERE student_id=?`, [studentId]
  );
  res.json({ overall: overall[0]?.overall || 0, perLab: rows, student_id: studentId, usn });
};

exports.studentStatus = async (req, res) => {
  const studentId = req.params.id;
  try {
    // 1. Profile details
    const [profileRows] = await db.execute(
      `SELECT s.*, u.full_name, u.email, u.phone FROM students s
       JOIN users u ON u.user_id = s.user_id WHERE s.student_id=?`, [studentId]
    );
    if (!profileRows.length) return res.status(404).json({ message: 'Student not found' });
    const profile = profileRows[0];
    const userId = profile.user_id;

    // 2. Attendance stats
    const [attendanceRows] = await db.execute(
      `SELECT l.lab_name, COUNT(*) AS total, SUM(a.status='present') AS present,
              ROUND(SUM(a.status='present')*100/COUNT(*),2) AS percentage
       FROM attendance a JOIN labs l ON l.lab_id=a.lab_id
       WHERE a.student_id=? GROUP BY l.lab_id`, [studentId]
    );
    const [overallRows] = await db.execute(
      `SELECT ROUND(SUM(status='present')*100/COUNT(*),2) AS overall
       FROM attendance WHERE student_id=?`, [studentId]
    );
    const attendance = {
      overall: overallRows[0]?.overall || 0,
      perLab: attendanceRows
    };

    // 3. Bookings
    const [bookings] = await db.execute(
      `SELECT b.*, l.lab_name FROM bookings b
       JOIN labs l ON l.lab_id = b.lab_id
       WHERE b.requested_by = ? ORDER BY b.booking_date DESC`, [userId]
    );

    // 4. Equipment requests / issued items
    const [equipment] = await db.execute(
      `SELECT r.*, e.name AS equipment_name, e.serial_no, e.category FROM equipment_requests r
       JOIN equipment e ON e.equipment_id = r.equipment_id
       WHERE r.student_id = ? ORDER BY r.issue_date DESC`, [studentId]
    );

    // 5. Complaints
    const [complaints] = await db.execute(
      `SELECT c.*, l.lab_name, e.name AS equipment_name FROM complaints c
       LEFT JOIN labs l ON l.lab_id = c.lab_id
       LEFT JOIN equipment e ON e.equipment_id = c.equipment_id
       WHERE c.raised_by = ? ORDER BY c.created_at DESC`, [userId]
    );

    // 6. MCQ Test submissions
    const [testSubmissions] = await db.execute(
      `SELECT ts.submission_id, ts.score, ts.submitted_at,
              t.subject, t.duration_minutes,
              (SELECT COUNT(*) FROM test_questions tq WHERE tq.test_id = ts.test_id) AS total_questions
       FROM test_submissions ts
       JOIN tests t ON ts.test_id = t.test_id
       WHERE ts.student_id = ? ORDER BY ts.submitted_at DESC`, [studentId]
    );

    res.json({
      profile,
      attendance,
      bookings,
      equipment,
      complaints,
      testSubmissions
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

