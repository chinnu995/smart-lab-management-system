const db = require('../config/db');
const bcrypt = require('bcryptjs');
const audit = require('../utils/audit');

exports.list = async (_req, res) => {
  const [rows] = await db.execute(
    `SELECT f.faculty_id, f.emp_code, u.full_name, u.email, u.phone, f.department, f.designation
       FROM faculty f JOIN users u ON u.user_id=f.user_id ORDER BY f.faculty_id DESC`
  );
  res.json(rows);
};

exports.create = async (req, res) => {
  const { full_name, email, password, phone, emp_code, department, designation } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(password || 'password123', 10);
    const [u] = await conn.execute(
      'INSERT INTO users (full_name,email,password_hash,role,phone) VALUES (?,?,?,?,?)',
      [full_name, email, hash, 'faculty', phone || null]
    );
    const [f] = await conn.execute(
      'INSERT INTO faculty (user_id,emp_code,department,designation) VALUES (?,?,?,?)',
      [u.insertId, emp_code, department, designation || null]
    );
    await conn.commit();
    audit.log(req.user.id, 'CREATE_FACULTY', 'faculty', f.insertId, `Created ${emp_code}`, req.ip);
    res.status(201).json({ faculty_id: f.insertId });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ message: e.message });
  } finally { conn.release(); }
};

exports.update = async (req, res) => {
  const { full_name, phone, department, designation } = req.body;
  const [f] = await db.execute('SELECT user_id FROM faculty WHERE faculty_id=?', [req.params.id]);
  if (!f.length) return res.status(404).json({ message: 'Not found' });
  await db.execute('UPDATE users SET full_name=COALESCE(?,full_name), phone=COALESCE(?,phone) WHERE user_id=?',
    [full_name, phone, f[0].user_id]);
  await db.execute('UPDATE faculty SET department=COALESCE(?,department), designation=COALESCE(?,designation) WHERE faculty_id=?',
    [department, designation, req.params.id]);
  res.json({ message: 'Updated' });
};

exports.remove = async (req, res) => {
  const [f] = await db.execute('SELECT user_id FROM faculty WHERE faculty_id=?', [req.params.id]);
  if (!f.length) return res.status(404).json({ message: 'Not found' });
  await db.execute('DELETE FROM users WHERE user_id=?', [f[0].user_id]);
  audit.log(req.user.id, 'DELETE_FACULTY', 'faculty', req.params.id, 'Deleted faculty', req.ip);
  res.json({ message: 'Deleted' });
};

exports.facultyStatus = async (req, res) => {
  const facultyId = req.params.id;
  try {
    // 1. Profile details
    const [profileRows] = await db.execute(
      `SELECT f.*, u.full_name, u.email, u.phone FROM faculty f
       JOIN users u ON u.user_id = f.user_id WHERE f.faculty_id=?`, [facultyId]
    );
    if (!profileRows.length) return res.status(404).json({ message: 'Faculty not found' });
    const profile = profileRows[0];
    const userId = profile.user_id;

    // 2. Attendance sheets marked
    const [attendance] = await db.execute(
      `SELECT a.attend_date, l.lab_name,
              COUNT(*) AS total_students,
              SUM(a.status='present') AS present_count
       FROM attendance a
       JOIN labs l ON l.lab_id = a.lab_id
       WHERE a.faculty_id = ?
       GROUP BY a.attend_date, l.lab_id
       ORDER BY a.attend_date DESC`, [facultyId]
    );

    // 3. Resolved complaints
    const [complaints] = await db.execute(
      `SELECT c.*, l.lab_name, e.name AS equipment_name, u.full_name AS raised_by_name FROM complaints c
       LEFT JOIN labs l ON l.lab_id = c.lab_id
       LEFT JOIN equipment e ON e.equipment_id = c.equipment_id
       LEFT JOIN users u ON u.user_id = c.raised_by
       WHERE c.resolved_by = ? AND c.status = 'resolved'
       ORDER BY c.resolved_at DESC`, [userId]
    );

    // 4. Handled bookings
    const [bookings] = await db.execute(
      `SELECT b.*, l.lab_name, u.full_name AS requested_by_name FROM bookings b
       JOIN labs l ON l.lab_id = b.lab_id
       JOIN users u ON u.user_id = b.requested_by
       WHERE b.approved_by = ? ORDER BY b.booking_date DESC`, [userId]
    );

    // 5. Conducted MCQ tests
    const [tests] = await db.execute(
      `SELECT t.test_id, t.subject, t.duration_minutes, t.status, t.created_at,
              COUNT(tq.question_id) AS question_count,
              (SELECT COUNT(*) FROM test_submissions ts WHERE ts.test_id = t.test_id) AS submission_count
       FROM tests t
       LEFT JOIN test_questions tq ON tq.test_id = t.test_id
       WHERE t.created_by = ?
       GROUP BY t.test_id
       ORDER BY t.created_at DESC`, [userId]
    );

    res.json({
      profile,
      attendance,
      complaints,
      bookings,
      tests
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

