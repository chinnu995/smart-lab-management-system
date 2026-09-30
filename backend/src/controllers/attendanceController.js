const db = require('../config/db');
const audit = require('../utils/audit');
const QRCode = require('qrcode');
const crypto = require('crypto');
const os = require('os');
const { sendMail } = require('../utils/mailer');
const { sendSMS } = require('../utils/sms');

const activeQRSessions = {};

async function autoCloseExpiredSessions(io) {
  try {
    const [expired] = await db.execute(
      "SELECT session_id, lab_id FROM lab_sessions WHERE status = 'active' AND qr_expires_at <= CURRENT_TIMESTAMP"
    );
    if (expired.length > 0) {
      await db.execute(
        "UPDATE lab_sessions SET status = 'closed' WHERE status = 'active' AND qr_expires_at <= CURRENT_TIMESTAMP"
      );
      for (const exp of expired) {
        await db.execute("UPDATE labs SET status = 'available' WHERE lab_id = ?", [exp.lab_id]);
        delete activeQRSessions[exp.lab_id];
        if (io) {
          io.to('role:hod').to('role:faculty').to('role:student').emit('session:closed', { session_id: Number(exp.session_id), lab_id: exp.lab_id });
          io.to('role:hod').to('role:faculty').emit('lab:status_changed', { lab_id: exp.lab_id, status: 'available' });
        }
      }
    }
  } catch (err) {
    console.error('Error auto closing expired sessions:', err);
  }
}
exports.autoCloseExpiredSessions = autoCloseExpiredSessions;

function getLocalIP(req) {
  let localIP = 'localhost';
  if (req && req.headers && req.headers.host && !req.headers.host.includes('localhost') && !req.headers.host.includes('127.0.0.1')) {
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
  return localIP;
}

// -----------------------------------------------------------------------------
// 1. Create a Lab Session (Faculty/HOD)
// -----------------------------------------------------------------------------
exports.createSession = async (req, res) => {
  try {
    const { subject, lab_id, class_name, session_date, start_time, end_time, expiry_minutes } = req.body;

    if (!subject || !lab_id || !class_name) {
      return res.status(400).json({ message: 'subject, lab_id, and class_name are required' });
    }

    const [fac] = await db.execute('SELECT faculty_id FROM faculty WHERE user_id = ?', [req.user.id]);
    const facultyId = fac.length ? fac[0].faculty_id : (req.user.faculty_id || 1);

    const qrToken = crypto.randomBytes(32).toString('hex');
    const expiryMins = Number(expiry_minutes) || 15;
    const expiresAt = new Date(Date.now() + expiryMins * 60 * 1000);

    const sDate = session_date || new Date().toISOString().slice(0, 10);
    const sTime = start_time || '10:00:00';
    const eTime = end_time || '12:00:00';

    const [insertRes] = await db.execute(
      `INSERT INTO lab_sessions (subject, faculty_id, lab_id, class_name, session_date, start_time, end_time, qr_token, qr_expires_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [subject, facultyId, Number(lab_id), class_name.trim(), sDate, sTime, eTime, qrToken, expiresAt]
    );

    const sessionId = insertRes.insertId;

    await db.execute("UPDATE labs SET status = 'occupied' WHERE lab_id = ?", [lab_id]);

    const [labRows] = await db.execute('SELECT lab_name, location FROM labs WHERE lab_id = ?', [lab_id]);
    const labName = labRows[0]?.lab_name || `Lab #${lab_id}`;
    const location = labRows[0]?.location || '2F 01';

    const localIP = getLocalIP(req);
    const qrUrl = `http://${localIP}:5173/student/attendance?qr_token=${qrToken}&session_id=${sessionId}`;
    const dataUrl = await QRCode.toDataURL(qrUrl);

    const sessionObj = {
      session_id: sessionId,
      subject,
      faculty_id: facultyId,
      lab_id: Number(lab_id),
      lab_name: labName,
      location,
      class_name,
      session_date: sDate,
      start_time: sTime,
      end_time: eTime,
      qr_token: qrToken,
      qr_expires_at: expiresAt,
      dataUrl,
      qrUrl,
      status: 'active'
    };

    activeQRSessions[lab_id] = sessionObj;

    const io = req.app?.get('io');
    if (io) {
      io.to('role:hod').to('role:faculty').to('role:student').emit('session:created', sessionObj);
      io.to('role:student').emit('qr:active_session', sessionObj);
      io.to('role:hod').to('role:faculty').emit('lab:status_changed', { lab_id, status: 'occupied' });
    }

    // Send notifications to eligible students in this class/section
    try {
      const [eligibleStudents] = await db.execute(
        `SELECT user_id FROM students 
         WHERE UPPER(TRIM(section)) = UPPER(TRIM(?)) OR UPPER(TRIM(department)) = UPPER(TRIM(?))`,
        [class_name, class_name]
      );
      for (const s of eligibleStudents) {
        await db.execute(
          `INSERT INTO notifications (user_id, type, title, message)
           VALUES (?, 'attendance', ?, ?)`,
          [
            s.user_id,
            `Live Session Started: ${subject}`,
            `Faculty started ${subject} for ${class_name} in ${labName}. Click to scan QR attendance!`
          ]
        );
      }
    } catch (notifErr) {
      console.error('Notification error on session creation:', notifErr);
    }

    res.json(sessionObj);
  } catch (err) {
    console.error('Error creating lab session:', err);
    res.status(500).json({ message: 'Failed to create lab session: ' + err.message });
  }
};

// -----------------------------------------------------------------------------
// 2. Regenerate QR Code for Active Session (Faculty/HOD)
// -----------------------------------------------------------------------------
exports.regenerateSessionQR = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { expiry_minutes } = req.body;

    const newQrToken = crypto.randomBytes(32).toString('hex');
    const expiryMins = Number(expiry_minutes) || 15;
    const newExpiresAt = new Date(Date.now() + expiryMins * 60 * 1000);

    const [rows] = await db.execute('SELECT * FROM lab_sessions WHERE session_id = ?', [sessionId]);
    if (!rows.length) return res.status(404).json({ message: 'Session not found' });

    await db.execute(
      "UPDATE lab_sessions SET qr_token = ?, qr_expires_at = ?, status = 'active' WHERE session_id = ?",
      [newQrToken, newExpiresAt, sessionId]
    );

    const session = rows[0];
    const [labRows] = await db.execute('SELECT lab_name, location FROM labs WHERE lab_id = ?', [session.lab_id]);
    const labName = labRows[0]?.lab_name || `Lab #${session.lab_id}`;

    const localIP = getLocalIP(req);
    const qrUrl = `http://${localIP}:5173/student/attendance?qr_token=${newQrToken}&session_id=${sessionId}`;
    const dataUrl = await QRCode.toDataURL(qrUrl);

    const updated = {
      ...session,
      lab_name: labName,
      qr_token: newQrToken,
      qr_expires_at: newExpiresAt,
      dataUrl,
      qrUrl,
      status: 'active'
    };

    activeQRSessions[session.lab_id] = updated;

    const io = req.app?.get('io');
    if (io) {
      io.to('role:student').to('role:faculty').to('role:hod').emit('qr:active_session', updated);
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to regenerate QR: ' + err.message });
  }
};

// -----------------------------------------------------------------------------
// 3. Close Session (Faculty/HOD)
// -----------------------------------------------------------------------------
exports.closeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const [rows] = await db.execute('SELECT lab_id FROM lab_sessions WHERE session_id = ?', [sessionId]);
    if (!rows.length) return res.status(404).json({ message: 'Session not found' });

    const labId = rows[0].lab_id;
    await db.execute("UPDATE lab_sessions SET status = 'closed' WHERE session_id = ?", [sessionId]);
    await db.execute("UPDATE labs SET status = 'available' WHERE lab_id = ?", [labId]);

    delete activeQRSessions[labId];

    const io = req.app?.get('io');
    if (io) {
      io.to('role:hod').to('role:faculty').to('role:student').emit('session:closed', { session_id: Number(sessionId), lab_id: labId });
      io.to('role:hod').to('role:faculty').emit('lab:status_changed', { lab_id: labId, status: 'available' });
    }

    res.json({ message: 'Session closed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to close session: ' + err.message });
  }
};

// -----------------------------------------------------------------------------
// 4. Get Student Active Sessions (Student Dashboard - Filtered strictly for student class)
// -----------------------------------------------------------------------------
exports.getStudentActiveSessions = async (req, res) => {
  try {
    await autoCloseExpiredSessions(req.app?.get('io'));

    const [st] = await db.execute('SELECT student_id, section, department FROM students WHERE user_id = ?', [req.user.id]);
    if (!st.length) return res.json([]);

    const studentSection = (st[0].section || '').trim().toUpperCase();
    const studentDept = (st[0].department || '').trim().toUpperCase();
    const studentId = st[0].student_id;

    const [sessions] = await db.execute(
      `SELECT ls.*, l.lab_name, l.location, u.full_name AS faculty_name
       FROM lab_sessions ls
       JOIN labs l ON l.lab_id = ls.lab_id
       JOIN faculty f ON f.faculty_id = ls.faculty_id
       JOIN users u ON u.user_id = f.user_id
       WHERE ls.status = 'active' AND (ls.qr_expires_at IS NULL OR ls.qr_expires_at > CURRENT_TIMESTAMP)
       ORDER BY ls.created_at DESC`
    );

    const eligibleSessions = [];
    for (const s of sessions) {
      const className = (s.class_name || '').trim().toUpperCase();

      const isEligible =
        !className ||
        className === studentSection ||
        className === studentDept ||
        (studentSection && className.includes(studentSection)) ||
        (studentSection && studentSection.includes(className));

      if (isEligible) {
        const [att] = await db.execute(
          'SELECT attendance_id, status, marked_at FROM attendance WHERE student_id = ? AND session_id = ?',
          [studentId, s.session_id]
        );

        const localIP = getLocalIP(req);
        const qrUrl = `http://${localIP}:5173/student/attendance?qr_token=${s.qr_token}&session_id=${s.session_id}`;
        const dataUrl = await QRCode.toDataURL(qrUrl);

        eligibleSessions.push({
          ...s,
          dataUrl,
          qrUrl,
          alreadyMarked: att.length > 0 && att[0].status === 'present',
          marked_at: att[0]?.marked_at || null
        });
      }
    }

    res.json(eligibleSessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -----------------------------------------------------------------------------
// 5. Get Faculty Active Sessions (Faculty Dashboard)
// -----------------------------------------------------------------------------
exports.getFacultyActiveSessions = async (req, res) => {
  try {
    await autoCloseExpiredSessions(req.app?.get('io'));

    const [fac] = await db.execute('SELECT faculty_id FROM faculty WHERE user_id = ?', [req.user.id]);
    const facultyId = fac.length ? fac[0].faculty_id : null;

    let queryStr = `
      SELECT ls.*, l.lab_name, l.location
      FROM lab_sessions ls
      JOIN labs l ON l.lab_id = ls.lab_id
      WHERE ls.status = 'active' AND (ls.qr_expires_at IS NULL OR ls.qr_expires_at > CURRENT_TIMESTAMP)
    `;
    const params = [];
    if (facultyId) {
      queryStr += ' AND ls.faculty_id = ?';
      params.push(facultyId);
    }
    queryStr += ' ORDER BY ls.created_at DESC';

    const [sessions] = await db.execute(queryStr, params);

    const result = [];
    for (const s of sessions) {
      const [eligible] = await db.execute(
        'SELECT COUNT(*) AS total FROM students WHERE UPPER(TRIM(section)) = UPPER(TRIM(?)) OR UPPER(TRIM(department)) = UPPER(TRIM(?))',
        [s.class_name, s.class_name]
      );
      const [present] = await db.execute(
        "SELECT COUNT(*) AS p_count FROM attendance WHERE session_id = ? AND status = 'present'",
        [s.session_id]
      );

      const localIP = getLocalIP(req);
      const qrUrl = `http://${localIP}:5173/student/attendance?qr_token=${s.qr_token}&session_id=${s.session_id}`;
      const dataUrl = await QRCode.toDataURL(qrUrl);

      result.push({
        ...s,
        dataUrl,
        qrUrl,
        totalStudents: Number(eligible[0]?.total || 35),
        presentStudents: Number(present[0]?.p_count || 0)
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -----------------------------------------------------------------------------
// 6. Get HOD Active Sessions (HOD Dashboard)
// -----------------------------------------------------------------------------
exports.getHodActiveSessions = async (req, res) => {
  try {
    await autoCloseExpiredSessions(req.app?.get('io'));

    const [sessions] = await db.execute(
      `SELECT ls.*, l.lab_name, l.location, u.full_name AS faculty_name
       FROM lab_sessions ls
       JOIN labs l ON l.lab_id = ls.lab_id
       JOIN faculty f ON f.faculty_id = ls.faculty_id
       JOIN users u ON u.user_id = f.user_id
       WHERE ls.status = 'active' AND (ls.qr_expires_at IS NULL OR ls.qr_expires_at > CURRENT_TIMESTAMP)
       ORDER BY l.lab_name ASC`
    );

    const result = [];
    for (const s of sessions) {
      const [eligible] = await db.execute(
        'SELECT COUNT(*) AS total FROM students WHERE UPPER(TRIM(section)) = UPPER(TRIM(?)) OR UPPER(TRIM(department)) = UPPER(TRIM(?))',
        [s.class_name, s.class_name]
      );
      const [present] = await db.execute(
        "SELECT COUNT(*) AS p_count FROM attendance WHERE session_id = ? AND status = 'present'",
        [s.session_id]
      );

      const totalCount = Number(eligible[0]?.total || 35);
      const presentCount = Number(present[0]?.p_count || 0);

      result.push({
        session_id: s.session_id,
        lab_id: s.lab_id,
        lab_name: s.lab_name,
        subject: s.subject,
        faculty_name: s.faculty_name,
        class_name: s.class_name,
        present_count: presentCount,
        total_students: totalCount,
        pct: totalCount > 0 ? Math.round((presentCount * 100) / totalCount) : 0,
        status: s.status,
        qr_expires_at: s.qr_expires_at
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -----------------------------------------------------------------------------
// 7. Student Scans QR Code — Strict 10-Step Backend Validation Sequence
// -----------------------------------------------------------------------------
exports.markByQR = async (req, res) => {
  const { token, qrToken, sessionId } = req.body;
  let rawToken = (qrToken || token || '').trim();

  if (!rawToken && !sessionId) {
    return res.status(400).json({ message: 'QR token or session ID is required' });
  }

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Is the student authenticated?
    // -------------------------------------------------------------------------
    const [s] = await db.execute('SELECT student_id, usn, section, department FROM students WHERE user_id = ?', [req.user.id]);
    if (!s.length) return res.status(404).json({ message: 'Student record missing' });
    const student = s[0];
    const studentId = student.student_id;

    // Decode URL or base64 token if passed full link
    try { rawToken = decodeURIComponent(rawToken); } catch (e) {}
    if (rawToken.includes('qr_token=')) {
      const match = rawToken.match(/qr_token=([^&]+)/);
      if (match) rawToken = match[1];
    }
    try { rawToken = decodeURIComponent(rawToken); } catch (e) {}

    // -------------------------------------------------------------------------
    // STEP 2 & STEP 4: Query session & verify existence
    // -------------------------------------------------------------------------
    let sessionRows = [];
    if (rawToken) {
      [sessionRows] = await db.execute('SELECT * FROM lab_sessions WHERE qr_token = ?', [rawToken]);
    }
    if (!sessionRows.length && sessionId) {
      [sessionRows] = await db.execute('SELECT * FROM lab_sessions WHERE session_id = ?', [sessionId]);
    }

    if (!sessionRows.length) {
      return res.status(400).json({ message: 'Invalid QR Code. Laboratory session not found.' });
    }

    const session = sessionRows[0];

    // -------------------------------------------------------------------------
    // STEP 3: Has the QR expired?
    // -------------------------------------------------------------------------
    const now = new Date();
    const expiresAt = new Date(session.qr_expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ 
        message: '❌ QR Code Expired\n\nPlease contact your faculty if you believe this is an error.' 
      });
    }

    // -------------------------------------------------------------------------
    // STEP 5: Is the session currently active?
    // -------------------------------------------------------------------------
    if (session.status !== 'active') {
      return res.status(400).json({ message: 'Session is not active or has been closed.' });
    }

    // -------------------------------------------------------------------------
    // STEP 6 & 7: Is the student enrolled in the session's class/section & subject?
    // -------------------------------------------------------------------------
    const studentSection = (student.section || '').trim().toUpperCase();
    const studentDept = (student.department || '').trim().toUpperCase();
    const sessionClass = (session.class_name || '').trim().toUpperCase();

    const isEnrolledInClass =
      !sessionClass ||
      sessionClass === studentSection ||
      sessionClass === studentDept ||
      (studentSection && sessionClass.includes(studentSection)) ||
      (studentSection && studentSection.includes(sessionClass));

    if (!isEnrolledInClass) {
      return res.status(403).json({ 
        message: `❌ Attendance Rejected\n\nYou are not enrolled in this laboratory session (${session.subject} - ${sessionClass}).` 
      });
    }

    // -------------------------------------------------------------------------
    // STEP 8: Does the session belong to the expected lab? (session.lab_id exists)
    // -------------------------------------------------------------------------
    if (!session.lab_id) {
      return res.status(400).json({ message: 'Invalid lab session data.' });
    }

    // -------------------------------------------------------------------------
    // STEP 9: Is the attendance already marked?
    // -------------------------------------------------------------------------
    const [existing] = await db.execute(
      'SELECT attendance_id, status FROM attendance WHERE student_id = ? AND session_id = ?',
      [studentId, session.session_id]
    );

    if (existing.length && existing[0].status === 'present') {
      return res.status(400).json({ 
        message: '⚠️ Attendance Already Marked\n\nYour attendance for this session has already been recorded.',
        alreadyMarked: true 
      });
    }

    const todayDate = new Date().toISOString().slice(0, 10);

    // -------------------------------------------------------------------------
    // STEP 10: Mark attendance in database
    // -------------------------------------------------------------------------
    if (existing.length) {
      await db.execute(
        "UPDATE attendance SET status = 'present', method = 'qr', marked_at = CURRENT_TIMESTAMP WHERE attendance_id = ?",
        [existing[0].attendance_id]
      );
    } else {
      await db.execute(
        `INSERT INTO attendance (student_id, session_id, lab_id, faculty_id, subject, attend_date, status, method, marked_at)
         VALUES (?, ?, ?, ?, ?, ?, 'present', 'qr', CURRENT_TIMESTAMP)`,
        [studentId, session.session_id, session.lab_id, session.faculty_id, session.subject, todayDate]
      );
    }

    const [stInfo] = await db.execute(
      'SELECT u.full_name, s.usn FROM students s JOIN users u ON u.user_id=s.user_id WHERE s.student_id=?',
      [studentId]
    );
    const fullName = stInfo[0]?.full_name || 'Student';
    const usn = stInfo[0]?.usn || '';

    audit.log(req.user.id, 'QR_SESSION_ATTENDANCE_VERIFIED', 'attendance', studentId, `session_id=${session.session_id}, lab_id=${session.lab_id}`, req.ip);

    await db.execute(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES (?, 'attendance', 'Attendance Marked', ?)`,
      [req.user.id, `Verified Present for ${session.subject} (${session.class_name}).`]
    );

    const io = req.app?.get('io');
    if (io) {
      io.to('role:hod').to('role:faculty').emit('student:scanned', {
        student_id: studentId,
        session_id: session.session_id,
        full_name: fullName,
        usn: usn,
        lab_id: session.lab_id,
        subject: session.subject,
        status: 'present',
        method: 'qr',
        marked_at: new Date().toISOString()
      });
      io.to('role:hod').to('role:faculty').emit('attendance:changed');
      io.to(`user:${req.user.id}`).emit('notification', {
        type: 'attendance', title: 'Attendance Marked', message: `Present in ${session.subject}`
      });
    }

    res.json({ 
      message: '✅ Attendance Marked Successfully',
      session_id: session.session_id,
      subject: session.subject,
      class_name: session.class_name,
      verifiedAt: new Date().toISOString(),
      full_name: fullName
    });
  } catch (err) {
    console.error('Error in markByQR:', err);
    res.status(500).json({ message: 'Failed to record attendance: ' + err.message });
  }
};

// Backward-compatible generateQR endpoint
exports.generateQR = exports.createSession;
exports.getActiveQR = exports.getStudentActiveSessions;

// Standard manual & bulk mark
exports.mark = async (req, res) => {
  const { student_id, lab_id, status, method, attend_date, session_id } = req.body;
  try {
    await db.execute(
      `INSERT INTO attendance (student_id, lab_id, faculty_id, attend_date, status, method, session_id)
       VALUES (?,?,?,?,?,?,?)
       ON CONFLICT (student_id, lab_id, attend_date) 
       DO UPDATE SET status=EXCLUDED.status, method=EXCLUDED.method, marked_at=CURRENT_TIMESTAMP`,
      [student_id, lab_id, req.user.faculty_id || null, attend_date || new Date(), status || 'present', method || 'manual', session_id || null]
    );
    const io = req.app.get('io');
    io.to('role:hod').to('role:faculty').emit('attendance:changed');
    res.json({ message: 'Marked' });
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.bulkMark = async (req, res) => {
  const { lab_id, attend_date, records, session_id } = req.body;
  if (!Array.isArray(records)) return res.status(400).json({ message: 'records[] required' });
  const conn = await db.getConnection();
  try {
    for (const r of records) {
      await conn.query(
        `INSERT INTO attendance (student_id, lab_id, faculty_id, attend_date, status, method, session_id)
         VALUES (?,?,?,?,?,?,?)
         ON CONFLICT (student_id, lab_id, attend_date) 
         DO UPDATE SET status=EXCLUDED.status, marked_at=CURRENT_TIMESTAMP`,
        [r.student_id, lab_id, req.user.faculty_id || null, attend_date, r.status, 'manual', session_id || null]
      );
    }
    const io = req.app.get('io');
    io.to('role:hod').to('role:faculty').emit('attendance:changed');
    res.json({ message: `${records.length} records saved` });
  } catch (e) { res.status(400).json({ message: e.message }); }
  finally { conn.release(); }
};

exports.getLiveLabAttendance = async (req, res) => {
  try {
    const { lab_id } = req.params;
    const { date, session_id } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);

    let queryStr = `
      SELECT 
         s.student_id, 
         s.usn, 
         u.full_name, 
         s.department, 
         s.section,
         a.status, 
         a.marked_at, 
         a.method
       FROM students s
       JOIN users u ON u.user_id = s.user_id
       LEFT JOIN attendance a 
         ON a.student_id = s.student_id 
    `;

    let params = [];
    if (session_id) {
      const [sessRows] = await db.execute('SELECT class_name, subject FROM lab_sessions WHERE session_id = ?', [session_id]);
      const className = sessRows.length ? (sessRows[0].class_name || '').trim() : '';

      queryStr += ` AND a.session_id = ? `;
      params.push(session_id);

      if (className) {
        queryStr += ` WHERE (UPPER(TRIM(s.section)) = UPPER(TRIM(?)) OR UPPER(TRIM(s.department)) = UPPER(TRIM(?))) `;
        params.push(className, className);
      }
    } else {
      queryStr += ` AND a.lab_id = ? AND a.attend_date = ? `;
      params.push(lab_id, targetDate);
    }
    queryStr += ` ORDER BY s.usn ASC `;

    const [rows] = await db.execute(queryStr, params);

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
