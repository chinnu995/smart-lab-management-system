const db = require('../config/db');
const audit = require('../utils/audit');
const QRCode = require('qrcode');
const { sendMail } = require('../utils/mailer');
const { sendSMS } = require('../utils/sms');

// Faculty marks attendance (manual / qr / camera)
exports.mark = async (req, res) => {
  const { student_id, lab_id, status, method, attend_date } = req.body;
  try {
    await db.execute(
      `INSERT INTO attendance (student_id, lab_id, faculty_id, attend_date, status, method)
       VALUES (?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE status=VALUES(status), method=VALUES(method), marked_at=NOW()`,
      [student_id, lab_id, req.user.faculty_id || null, attend_date || new Date(), status || 'present', method || 'manual']
    );
    const [st] = await db.execute('SELECT user_id FROM students WHERE student_id=?', [student_id]);
    if (st.length) {
      const student_user_id = st[0].user_id;
      await db.execute(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES (?, 'attendance', 'Attendance Marked', ?)`,
        [student_user_id, `You were marked ${status} in the lab.`]
      );
      const io = req.app.get('io');
      io.to(`user:${student_user_id}`).emit('notification', {
        type: 'attendance', title: 'Attendance Marked', message: `You were marked ${status}.`
      });
    }
    const io = req.app.get('io');
    io.to('role:hod').to('role:faculty').emit('attendance:changed');

    // Parent alert if < 85%
    const [pct] = await db.execute(
      `SELECT ROUND(SUM(status='present')*100/COUNT(*),2) AS p FROM attendance WHERE student_id=?`,
      [student_id]
    );
    if (pct[0]?.p !== null && pct[0].p < 85) {
      const [parents] = await db.execute(
        `SELECT parent_name, email, phone, u.full_name AS sname
           FROM parent_details p JOIN students s ON s.student_id=p.student_id
           JOIN users u ON u.user_id=s.user_id WHERE p.student_id=?`, [student_id]
      );
      for (const p of parents) {
        if (p.email) sendMail({ to: p.email, subject: 'Attendance Alert',
          html: `<p>Dear ${p.parent_name},</p><p>Your ward <b>${p.sname}</b> currently has attendance of <b>${pct[0].p}%</b> which is below the required 85%.</p>` });
        if (p.phone) sendSMS(p.phone, `Smart Lab Alert: ${p.sname}'s attendance is ${pct[0].p}% (<85%).`);
      }
    }
    res.json({ message: 'Marked', percentage: pct[0]?.p });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

// Bulk attendance for a class
exports.bulkMark = async (req, res) => {
  const { lab_id, attend_date, records } = req.body; // [{student_id, status}]
  if (!Array.isArray(records)) return res.status(400).json({ message: 'records[] required' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const r of records) {
      await conn.execute(
        `INSERT INTO attendance (student_id, lab_id, faculty_id, attend_date, status, method)
         VALUES (?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE status=VALUES(status), marked_at=NOW()`,
        [r.student_id, lab_id, req.user.faculty_id || null, attend_date, r.status, 'manual']
      );
    }
    await conn.commit();
    const io = req.app.get('io');
    io.to('role:hod').to('role:faculty').emit('attendance:changed');
    res.json({ message: `${records.length} records saved` });
  } catch (e) { await conn.rollback(); res.status(400).json({ message: e.message }); }
  finally { conn.release(); }
};

// Generate QR token for a session — student scans and POSTs to /qr
exports.generateQR = async (req, res) => {
  const { lab_id } = req.body;
  const payload = { lab_id, date: new Date().toISOString().slice(0,10), faculty: req.user.id, ts: Date.now() };
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');

  // Dynamically resolve local network IP address to make QR clickable on mobile devices
  const os = require('os');
  let localIP = 'localhost';
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        localIP = alias.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }

  // Construct clickable URL for mobile scanners
  const qrUrl = `http://${localIP}:5173/student/attendance?qr_token=${token}`;
  const dataUrl = await QRCode.toDataURL(qrUrl);

  // Update lab status to occupied when session starts
  await db.execute('UPDATE labs SET status="occupied" WHERE lab_id=?', [lab_id]);
  const io = req.app.get('io');
  io.to('role:hod').to('role:faculty').emit('lab:status_changed', { lab_id, status: 'occupied' });

  res.json({ token, dataUrl, payload, qrUrl });
};

// Student submits QR
exports.markByQR = async (req, res) => {
  const { token } = req.body;
  let payload;
  try { payload = JSON.parse(Buffer.from(token, 'base64').toString()); }
  catch { return res.status(400).json({ message: 'Invalid token' }); }
  if (Date.now() - payload.ts > 15 * 60 * 1000) return res.status(400).json({ message: 'Token expired' });

  const [s] = await db.execute('SELECT student_id FROM students WHERE user_id=?', [req.user.id]);
  if (!s.length) return res.status(404).json({ message: 'Student record missing' });
  await db.execute(
    `INSERT INTO attendance (student_id, lab_id, attend_date, status, method)
     VALUES (?,?,?, 'present', 'qr')
     ON DUPLICATE KEY UPDATE status='present', method='qr', marked_at=NOW()`,
    [s[0].student_id, payload.lab_id, payload.date]
  );
  await db.execute(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES (?, 'attendance', 'Attendance Marked', 'Your attendance was marked present via QR.')`,
    [req.user.id]
  );
  const io = req.app.get('io');
  io.to('role:hod').to('role:faculty').emit('attendance:changed');
  res.json({ message: 'Attendance marked via QR' });
};

// Camera attendance — integration stub. In production, a face-recognition
// service (face-api.js / OpenCV) sends a verified student_id + confidence here.
exports.markByCamera = async (req, res) => {
  const { student_id, lab_id, confidence, image_path, image } = req.body;
  if (!student_id || !lab_id) return res.status(400).json({ message: 'student_id & lab_id required' });

  let savedPath = image_path || null;
  if (image && image.startsWith('data:image')) {
    try {
      const fs = require('fs');
      const path = require('path');
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `face_attendance_${student_id}_${Date.now()}.jpg`;
      const uploadDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      savedPath = `/uploads/${filename}`;
    } catch (err) {
      console.error('Failed to save uploaded face image:', err);
    }
  }

  await db.execute(
    `INSERT INTO attendance (student_id, lab_id, attend_date, status, method)
     VALUES (?,?,CURDATE(), 'present', 'camera')
     ON DUPLICATE KEY UPDATE status='present', method='camera', marked_at=NOW()`,
    [student_id, lab_id]
  );
  await db.execute(
    'INSERT INTO face_attendance (student_id, confidence, image_path) VALUES (?,?,?)',
    [student_id, confidence || null, savedPath]
  );

  const [st] = await db.execute('SELECT user_id FROM students WHERE student_id=?', [student_id]);
  if (st.length) {
    const student_user_id = st[0].user_id;
    await db.execute(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES (?, 'attendance', 'Attendance Marked', 'Your attendance was marked present via Camera Face Recognition.')`,
      [student_user_id]
    );
    const io = req.app.get('io');
    io.to(`user:${student_user_id}`).emit('notification', {
      type: 'attendance', title: 'Attendance Marked', message: 'Your face was recognized.'
    });
  }
  const io = req.app.get('io');
  io.to('role:hod').to('role:faculty').emit('attendance:changed');

  audit.log(req.user?.id || null, 'CAMERA_ATTENDANCE', 'attendance', student_id, `confidence=${confidence}`, req.ip);
  res.json({ message: 'Face attendance recorded', image_path: savedPath });
};

exports.report = async (req, res) => {
  const { from, to, lab_id } = req.query;
  let sql = `SELECT a.*, u.full_name, s.usn, l.lab_name
               FROM attendance a
               JOIN students s ON s.student_id=a.student_id
               JOIN users u ON u.user_id=s.user_id
               JOIN labs l ON l.lab_id=a.lab_id WHERE 1=1`;
  const params = [];
  if (from)   { sql += ' AND a.attend_date>=?'; params.push(from); }
  if (to)     { sql += ' AND a.attend_date<=?'; params.push(to); }
  if (lab_id) { sql += ' AND a.lab_id=?'; params.push(lab_id); }
  sql += ' ORDER BY a.attend_date DESC';
  const [rows] = await db.execute(sql, params);
  res.json(rows);
};
