const db = require('../config/db');
const audit = require('../utils/audit');
const QRCode = require('qrcode');
const { sendMail } = require('../utils/mailer');
const { sendSMS } = require('../utils/sms');

const activeQRSessions = {};

// Faculty marks attendance (manual / qr / camera)
exports.mark = async (req, res) => {
  const { student_id, lab_id, status, method, attend_date } = req.body;
  try {
    await db.execute(
      `INSERT INTO attendance (student_id, lab_id, faculty_id, attend_date, status, method)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT (student_id, lab_id, attend_date) 
       DO UPDATE SET status=EXCLUDED.status, method=EXCLUDED.method, marked_at=CURRENT_TIMESTAMP`,
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
      `SELECT ROUND(SUM(CASE WHEN status='present' THEN 1 ELSE 0 END)*100.0/NULLIF(COUNT(*),0),2) AS p FROM attendance WHERE student_id=?`,
      [student_id]
    );
    if (pct[0]?.p !== null && pct[0]?.p < 85) {
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
    for (const r of records) {
      await conn.query(
        `INSERT INTO attendance (student_id, lab_id, faculty_id, attend_date, status, method)
         VALUES (?,?,?,?,?,?)
         ON CONFLICT (student_id, lab_id, attend_date) 
         DO UPDATE SET status=EXCLUDED.status, marked_at=CURRENT_TIMESTAMP`,
        [r.student_id, lab_id, req.user.faculty_id || null, attend_date, r.status, 'manual']
      );
    }
    const io = req.app.get('io');
    io.to('role:hod').to('role:faculty').emit('attendance:changed');
    res.json({ message: `${records.length} records saved` });
  } catch (e) { res.status(400).json({ message: e.message }); }
  finally { conn.release(); }
};

// Generate QR token for a session — student scans and POSTs to /qr
exports.generateQR = async (req, res) => {
  try {
    const { lab_id } = req.body;
    if (!lab_id) return res.status(400).json({ message: 'lab_id is required' });

    const crypto = require('crypto');
    const todayDate = new Date().toISOString().slice(0, 10);
    const nonce = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();

    const [labRows] = await db.execute('SELECT lab_name, location FROM labs WHERE lab_id=?', [lab_id]);
    const labName = labRows[0]?.lab_name || `Lab #${lab_id}`;

    // Anti-proxy dynamic payload: unique per day, timestamp & random nonce
    const payload = {
      lab_id: Number(lab_id),
      lab_name: labName,
      date: todayDate,
      faculty_id: req.user.id,
      ts: timestamp,
      nonce: nonce,
      session_id: `LAB${lab_id}_${todayDate.replace(/-/g, '')}_${nonce}`
    };

    const token = Buffer.from(JSON.stringify(payload)).toString('base64');

    // Generate QR code data URL (encodes both URL and token directly)
    const os = require('os');
    let localIP = 'localhost';
    if (req.headers && req.headers.host && !req.headers.host.includes('localhost') && !req.headers.host.includes('127.0.0.1')) {
      localIP = req.headers.host.split(':')[0];
    } else {
      const interfaces = os.networkInterfaces();
      for (const devName in interfaces) {
        const low = devName.toLowerCase();
        if (low.includes('virtual') || low.includes('vbox') || low.includes('vmnet') || low.includes('wsl') || low.includes('hyper-v')) {
          continue;
        }
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
    }

    const qrUrl = `http://${localIP}:5173/student/attendance?qr_token=${token}`;
    const dataUrl = await QRCode.toDataURL(qrUrl);

    // Save active session in-memory
    activeQRSessions[lab_id] = {
      lab_id: Number(lab_id),
      lab_name: labName,
      location: labRows[0]?.location || 'Main Hall',
      token,
      dataUrl,
      qrUrl,
      payload,
      createdAt: timestamp
    };

    // Update lab status to occupied when session starts
    await db.execute("UPDATE labs SET status='occupied' WHERE lab_id=?", [lab_id]);
    const io = req.app?.get('io');
    if (io) {
      io.to('role:hod').to('role:faculty').emit('lab:status_changed', { lab_id, status: 'occupied' });
      // Broadcast live QR session directly to all connected students
      io.to('role:student').emit('qr:active_session', activeQRSessions[lab_id]);
    }

    // Broadcast system notification to student accounts
    try {
      const [allStudents] = await db.execute('SELECT user_id FROM students');
      for (const s of allStudents) {
        await db.execute(
          `INSERT INTO notifications (user_id, type, title, message)
           VALUES (?, 'attendance', ?, ?)`,
          [s.user_id, `Live QR Attendance: ${labName}`, `Faculty started a live QR attendance session for ${labName}. Click or scan to mark present!`]
        );
      }
    } catch (notifErr) {
      console.error('Notification dispatch error:', notifErr);
    }

    res.json({ 
      token, 
      dataUrl, 
      payload, 
      qrUrl,
      lab_name: labName,
      expiresInMinutes: 10,
      antiProxyNotice: 'Dynamic Anti-Proxy Active: QR code generated and sent to student dashboards.' 
    });
  } catch (err) {
    console.error('Error generating QR:', err);
    res.status(500).json({ message: 'Failed to generate QR code: ' + err.message });
  }
};

// Get active QR sessions for student dashboard
exports.getActiveQR = async (req, res) => {
  try {
    const now = Date.now();
    const activeList = Object.values(activeQRSessions).filter(s => (now - s.createdAt) <= 10 * 60 * 1000);
    res.json(activeList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get live student attendance list for a specific lab session today
exports.getLiveLabAttendance = async (req, res) => {
  try {
    const { lab_id } = req.params;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);

    const [rows] = await db.execute(
      `SELECT 
         s.student_id, 
         s.usn, 
         u.full_name, 
         s.department, 
         a.status, 
         a.marked_at, 
         a.method
       FROM students s
       JOIN users u ON u.user_id = s.user_id
       LEFT JOIN attendance a 
         ON a.student_id = s.student_id 
        AND a.lab_id = ? 
        AND a.attend_date = ?
       ORDER BY s.usn ASC`,
      [lab_id, targetDate]
    );

    const totalCount = rows.length;
    const presentCount = rows.filter(r => r.status === 'present').length;
    const pendingCount = totalCount - presentCount;

    res.json({
      students: rows,
      totalCount,
      presentCount,
      pendingCount,
      targetDate
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch live attendance: ' + err.message });
  }
};

// Student submits QR token / URL
exports.markByQR = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'QR token is required' });

  let rawToken = token.trim();

  // 1. Try URL decoding
  try {
    rawToken = decodeURIComponent(rawToken);
  } catch (e) {}

  // 2. Extract token parameter if full URL is supplied
  if (rawToken.includes('qr_token=')) {
    const match = rawToken.match(/qr_token=([^&]+)/);
    if (match) rawToken = match[1];
  }

  // 3. Try URL decoding again after parameter extraction
  try {
    rawToken = decodeURIComponent(rawToken);
  } catch (e) {}

  let payload;
  try {
    const decoded = Buffer.from(rawToken, 'base64').toString('utf8');
    payload = JSON.parse(decoded);
  } catch (e1) {
    try {
      payload = JSON.parse(rawToken);
    } catch (e2) {
      return res.status(400).json({ message: 'Invalid QR token format' });
    }
  }

  if (!payload || !payload.lab_id || !payload.date || !payload.ts) {
    return res.status(400).json({ message: 'Invalid or tampered QR token payload' });
  }

  // 1. Anti-Proxy Verification: Strict Date Matching (with timezone boundary tolerance)
  const currentDate = new Date().toISOString().slice(0, 10);
  const localDate = new Date().toLocaleDateString('en-CA');
  if (payload.date !== currentDate && payload.date !== localDate) {
    return res.status(400).json({ 
      message: `Anti-Proxy Protection: This QR code was generated for date ${payload.date} and cannot be used today.` 
    });
  }

  // 2. Anti-Proxy Verification: 10-minute session expiration window
  const ageMs = Date.now() - payload.ts;
  if (ageMs > 10 * 60 * 1000) {
    return res.status(400).json({ 
      message: 'Anti-Proxy Expiration: This QR code session has expired (10-minute limit). Please ask faculty to generate a fresh QR code.' 
    });
  }

  try {
    const [s] = await db.execute('SELECT student_id FROM students WHERE user_id=?', [req.user.id]);
    if (!s.length) return res.status(404).json({ message: 'Student record missing' });

    const studentId = s[0].student_id;
    const labId = payload.lab_id;

    // 3. Anti-Proxy Check: Check if student already marked present today
    const [existing] = await db.execute(
      'SELECT attendance_id, status FROM attendance WHERE student_id = ? AND lab_id = ? AND attend_date = ?',
      [studentId, labId, currentDate]
    );

    if (existing.length && existing[0].status === 'present') {
      return res.json({ 
        message: 'Attendance was already marked present for today\'s lab session.', 
        alreadyMarked: true 
      });
    }

    if (existing.length) {
      await db.execute(
        "UPDATE attendance SET status = 'present', method = 'qr', marked_at = CURRENT_TIMESTAMP WHERE attendance_id = ?",
        [existing[0].attendance_id]
      );
    } else {
      await db.execute(
        "INSERT INTO attendance (student_id, lab_id, attend_date, status, method) VALUES (?, ?, ?, 'present', 'qr')",
        [studentId, labId, currentDate]
      );
    }

    const [stInfo] = await db.execute(
      'SELECT u.full_name, s.usn FROM students s JOIN users u ON u.user_id=s.user_id WHERE s.student_id=?',
      [studentId]
    );
    const fullName = stInfo[0]?.full_name || 'Student';
    const usn = stInfo[0]?.usn || '';

    // Security Anti-Proxy Audit log
    audit.log(req.user.id, 'QR_ATTENDANCE_VERIFIED', 'attendance', studentId, `session_id=${payload.session_id || 'N/A'}, lab_id=${labId}`, req.ip);

    await db.execute(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES (?, 'attendance', 'Attendance Marked', 'Your attendance was verified and marked present via dynamic QR code.')`,
      [req.user.id]
    );

    const io = req.app?.get('io');
    if (io) {
      io.to('role:hod').to('role:faculty').emit('student:scanned', {
        student_id: studentId,
        full_name: fullName,
        usn: usn,
        lab_id: labId,
        status: 'present',
        method: 'qr',
        marked_at: new Date().toISOString()
      });
      io.to('role:hod').to('role:faculty').emit('attendance:changed');
      io.to(`user:${req.user.id}`).emit('notification', {
        type: 'attendance', title: 'Attendance Marked', message: 'Verified via dynamic daily QR.'
      });
    }

    res.json({ 
      message: 'Attendance verified & marked via dynamic daily QR code successfully!',
      verifiedDate: currentDate,
      sessionId: payload.session_id || 'Active',
      full_name: fullName
    });
  } catch (err) {
    console.error('Error marking QR attendance:', err);
    res.status(500).json({ message: 'Failed to record QR attendance: ' + err.message });
  }
};

// Camera attendance
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
     VALUES (?,?,CURRENT_DATE, 'present', 'camera')
     ON CONFLICT (student_id, lab_id, attend_date) 
     DO UPDATE SET status='present', method='camera', marked_at=CURRENT_TIMESTAMP`,
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
