const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const audit = require('../utils/audit');
const { sendMail } = require('../services/emailService');
const { normalizeAndValidateEmail, generateSecureOtp, hashOtp, verifyOtpHash } = require('../utils/otpHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'smart_lab_dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Using a fallback development secret. Set JWT_SECRET in your .env for production.');
}

exports.login = async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const inputClean = email.trim();
  let rows = [];

  if (inputClean.includes('@')) {
    const [emailRows] = await db.execute('SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND is_active=true', [inputClean]);
    rows = emailRows;
  } else {
    const [usnRows] = await db.execute(
      'SELECT u.* FROM users u JOIN students s ON u.user_id = s.user_id WHERE (LOWER(s.usn) = LOWER(?) OR LOWER(u.email) = LOWER(?)) AND u.is_active=true',
      [inputClean, inputClean]
    );
    rows = usnRows;
  }
  if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  let usn = null;
  let emp_code = null;
  let department = null;
  let student_id = null;
  let faculty_id = null;
  let subject = null;
  let scheme = null;
  let semester = null;
  let cycle = null;
  if (user.role === 'student') {
    const [stdRows] = await db.execute('SELECT student_id, usn, department, semester, scheme, cycle FROM students WHERE user_id=?', [user.user_id]);
    if (stdRows.length) {
      student_id = stdRows[0].student_id;
      usn = stdRows[0].usn;
      department = stdRows[0].department;
      semester = stdRows[0].semester;
      scheme = stdRows[0].scheme;
      cycle = stdRows[0].cycle || user.cycle || null;
    }
  } else if (user.role === 'faculty' || user.role === 'hod') {
    const [facRows] = await db.execute('SELECT faculty_id, emp_code, department, subject, scheme, semester FROM faculty WHERE user_id=?', [user.user_id]);
    if (facRows.length) {
      faculty_id = facRows[0].faculty_id;
      emp_code = facRows[0].emp_code;
      department = facRows[0].department || 'Computer Science & Engineering';
      subject = facRows[0].subject;
      scheme = facRows[0].scheme;
      semester = facRows[0].semester || user.semester || null;
    } else if (user.role === 'hod') {
      department = 'Computer Science & Engineering';
    }
  }

  const token = jwt.sign(
    { id: user.user_id, role: user.role, name: user.full_name, email: user.email, student_id, faculty_id, subject, scheme, semester, cycle },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  audit.log(user.user_id, 'USER_LOGIN', 'users', user.user_id, 'User logged in', req.ip);

  res.json({
    token,
    user: { id: user.user_id, name: user.full_name, email: user.email, role: user.role, profile_image: user.profile_image || null, usn, emp_code, department, subject, scheme, semester, cycle }
  });
};

exports.register = async (req, res) => {
  // HOD-only registration of users
  const { full_name, email, password, role, phone } = req.body;
  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const [r] = await db.query(
      'INSERT INTO users (full_name,email,password_hash,role,phone) VALUES (?,?,?,?,?)',
      [full_name, email, hash, role, phone || null]
    );
    audit.log(req.user.id, 'REGISTER_USER', 'users', r.insertId, `Created ${role}: ${email}`, req.ip);
    res.status(201).json({ id: r.insertId, message: 'User created' });
  } catch (e) {
    if (e.code === '23505' || e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already in use' });
    res.status(500).json({ message: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.user_id, u.full_name, u.email, u.role, u.phone, u.profile_image, u.scheme_id, u.dept AS user_dept, u.semester AS user_sem, u.cycle AS user_cycle,
              s.usn, s.semester, s.batch_year, s.department AS student_dept, s.scheme AS student_scheme, s.cycle AS student_cycle,
              f.emp_code, f.department AS faculty_dept, f.subject AS faculty_subject, f.scheme AS faculty_scheme,
              sch.name AS scheme_name
       FROM users u
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN faculty f ON u.user_id = f.user_id
       LEFT JOIN schemes sch ON u.scheme_id = sch.id
       WHERE u.user_id=?`,
      [req.user.id]
    );
    const u = rows[0] || null;
    if (u) {
      u.department = u.role === 'student'
        ? (u.student_dept || u.user_dept || 'Computer Science & Engineering')
        : u.role === 'faculty'
        ? (u.faculty_dept || u.user_dept || 'Computer Science & Engineering')
        : 'Computer Science & Engineering';
      u.scheme = u.role === 'student'
        ? (u.student_scheme || u.scheme_name || null)
        : (u.faculty_scheme || u.scheme_name || null);
      if (u.role === 'student') {
        u.semester = u.semester || u.user_sem || 1;
        u.cycle = u.student_cycle || u.user_cycle || null;
      }
      u.subject = u.faculty_subject || null;
      delete u.student_dept;
      delete u.faculty_dept;
      delete u.student_scheme;
      delete u.faculty_scheme;
      delete u.user_dept;
      delete u.user_sem;
      delete u.scheme_name;
      delete u.student_cycle;
      delete u.user_cycle;
    }
    res.json(u);
  } catch (err) {
    console.error('Error in me controller:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { full_name, phone, department, academic_year, semester, current_password, new_password } = req.body;

  try {
    const [userRows] = await db.execute('SELECT * FROM users WHERE user_id=?', [userId]);
    if (!userRows.length) return res.status(404).json({ message: 'User not found' });
    const user = userRows[0];

    // Handle profile image upload if file attached
    if (req.file) {
      const profileImageUrl = `/uploads/profiles/${req.file.filename}`;
      await db.execute('UPDATE users SET profile_image=? WHERE user_id=?', [profileImageUrl, userId]);
    }

    // Handle password update if requested
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ message: 'Current password is required to update password' });
      }
      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }
      if (new_password.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }
      const hash = await bcrypt.hash(new_password, 10);
      await db.execute('UPDATE users SET password_hash=? WHERE user_id=?', [hash, userId]);
    }

    // Update basic user profile (full_name, phone)
    if (full_name || phone) {
      await db.execute(
        'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE user_id = ?',
        [full_name ? full_name.trim() : null, phone ? phone.trim() : null, userId]
      );
    }

    // Update role-specific department
    if (department) {
      const deptTrim = department.trim();
      if (user.role === 'student') {
        await db.execute('UPDATE students SET department = ? WHERE user_id = ?', [deptTrim, userId]);
      } else if (user.role === 'faculty') {
        await db.execute('UPDATE faculty SET department = ? WHERE user_id = ?', [deptTrim, userId]);
      }
    }

    // Update student-specific profile fields (semester/academic year/scheme)
    if (user.role === 'student') {
      let semVal = semester ? parseInt(semester) : null;
      if (academic_year && !semVal) {
        if (academic_year.includes('1')) semVal = 1;
        else if (academic_year.includes('2')) semVal = 3;
        else if (academic_year.includes('3')) semVal = 5;
        else if (academic_year.includes('4')) semVal = 7;
      }
      if (semVal) {
        await db.execute('UPDATE students SET semester = ? WHERE user_id = ?', [semVal, userId]);
      }
      if (req.body.scheme) {
        await db.execute('UPDATE students SET scheme = ? WHERE user_id = ?', [req.body.scheme.trim(), userId]);
      }
      if (req.body.cycle !== undefined) {
        let cVal = req.body.cycle ? String(req.body.cycle).trim().toUpperCase() : null;
        if (cVal && (cVal.includes('P') || cVal.startsWith('P'))) cVal = 'P';
        else if (cVal && (cVal.includes('C') || cVal.startsWith('C'))) cVal = 'C';
        else cVal = null;
        await db.execute('UPDATE students SET cycle = ? WHERE user_id = ?', [cVal, userId]);
        await db.execute('UPDATE users SET cycle = ? WHERE user_id = ?', [cVal, userId]);
      }
    } else if (user.role === 'faculty' && req.body.scheme) {
      await db.execute('UPDATE faculty SET scheme = ? WHERE user_id = ?', [req.body.scheme.trim(), userId]);
    }

    // Sync users table scheme_id, dept, semester
    if (req.body.scheme || department || semester) {
      const schemeVal = req.body.scheme ? req.body.scheme.trim() : null;
      let schemeId = null;
      if (schemeVal) {
        const yr = schemeVal.replace(/\D/g, '') || schemeVal;
        const [sch] = await db.execute('SELECT id FROM schemes WHERE name = ? OR name LIKE ? LIMIT 1', [yr, `${yr}%`]);
        if (sch && sch[0]) schemeId = sch[0].id;
      }
      const deptVal = department ? department.trim() : null;
      const semVal = semester ? parseInt(semester) : null;
      await db.execute(`
        UPDATE users
        SET 
          dept = COALESCE(?, dept),
          semester = COALESCE(?, semester),
          scheme_id = COALESCE(?, scheme_id)
        WHERE user_id = ?
      `, [deptVal, semVal, schemeId, userId]);
    }

    audit.log(userId, 'UPDATE_PROFILE', 'users', userId, 'Updated profile details', req.ip);

    // Fetch updated user info
    const [updatedUserRows] = await db.execute(
      'SELECT u.user_id, u.full_name, u.email, u.role, u.phone, u.profile_image, u.cycle AS user_cycle, s.usn, s.semester, s.batch_year, s.department AS student_dept, s.scheme AS student_scheme, s.cycle AS student_cycle, f.emp_code, f.department AS faculty_dept, f.subject AS faculty_subject, f.scheme AS faculty_scheme FROM users u LEFT JOIN students s ON u.user_id = s.user_id LEFT JOIN faculty f ON u.user_id = f.user_id WHERE u.user_id=?',
      [userId]
    );
    const u = updatedUserRows[0];
    u.id = u.user_id;
    u.name = u.full_name;
    u.profile_image = u.profile_image || null;
    u.department = u.role === 'student' ? (u.student_dept || 'Computer Science & Engineering') : u.role === 'faculty' ? (u.faculty_dept || 'Computer Science & Engineering') : 'Computer Science & Engineering';
    u.scheme = u.role === 'student' ? u.student_scheme : u.faculty_scheme;
    u.cycle = u.role === 'student' ? (u.student_cycle || u.user_cycle || null) : null;
    u.subject = u.faculty_subject || null;
    delete u.student_dept;
    delete u.faculty_dept;
    delete u.student_scheme;
    delete u.faculty_scheme;
    delete u.student_cycle;
    delete u.user_cycle;

    res.json({ message: 'Profile updated successfully', user: u });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: err.message || 'Failed to update profile' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const [rows] = await db.execute('SELECT user_id, full_name FROM users WHERE email=?', [email]);
  if (!rows.length) return res.json({ message: 'If the email exists, a reset link has been sent.' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await db.execute('UPDATE users SET reset_token=?, reset_expires=? WHERE user_id=?',
    [token, expires, rows[0].user_id]);

  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  try {
    await sendMail({
      to: email,
      subject: 'Smart Lab — Password Reset',
      html: `<p>Hi ${rows[0].full_name},</p><p>Reset your password: <a href="${link}">${link}</a></p>`,
    });
    const isDev = process.env.NODE_ENV !== 'production' && (process.env.NODE_ENV === 'development' || !process.env.SMTP_USER || process.env.SMTP_USER.includes('your_email@gmail.com'));
    res.json({
      message: 'A password reset link has been sent to your email.',
      resetLink: isDev ? link : undefined
    });
  } catch (err) {
    console.error('Failed to send reset email:', err);
    res.status(500).json({ message: 'Failed to send password reset link email. Please check your SMTP configuration.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const [rows] = await db.execute(
    'SELECT user_id FROM users WHERE reset_token=? AND reset_expires > CURRENT_TIMESTAMP', [token]
  );
  if (!rows.length) return res.status(400).json({ message: 'Invalid or expired token' });
  const hash = await bcrypt.hash(password, 10);
  await db.execute(
    'UPDATE users SET password_hash=?, reset_token=NULL, reset_expires=NULL WHERE user_id=?',
    [hash, rows[0].user_id]
  );
  res.json({ message: 'Password updated' });
};

exports.verifyCode = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and verification code required' });
  }

  // Verify OTP
  const [otpRows] = await db.execute(
    'SELECT * FROM login_otps WHERE email=? AND otp=? AND expires_at > CURRENT_TIMESTAMP',
    [email, otp]
  );

  if (!otpRows.length) {
    return res.status(401).json({ message: 'Invalid or expired verification code' });
  }

  // OTP verified, get user details
  const [userRows] = await db.execute('SELECT * FROM users WHERE email=? AND is_active=true', [email]);
  if (!userRows.length) {
    return res.status(404).json({ message: 'User account not found' });
  }

  const user = userRows[0];

  // Delete the used OTP
  await db.execute('DELETE FROM login_otps WHERE email=?', [email]);

  let usn = null;
  let emp_code = null;
  let department = null;
  let student_id = null;
  let faculty_id = null;
  let subject = null;
  let scheme = null;
  if (user.role === 'student') {
    const [stdRows] = await db.execute('SELECT student_id, usn, department, scheme FROM students WHERE user_id=?', [user.user_id]);
    if (stdRows.length) {
      student_id = stdRows[0].student_id;
      usn = stdRows[0].usn;
      department = stdRows[0].department;
      scheme = stdRows[0].scheme;
    }
  } else if (user.role === 'faculty' || user.role === 'hod') {
    const [facRows] = await db.execute('SELECT faculty_id, emp_code, department, subject, scheme, semester FROM faculty WHERE user_id=?', [user.user_id]);
    if (facRows.length) {
      faculty_id = facRows[0].faculty_id;
      emp_code = facRows[0].emp_code;
      department = facRows[0].department || 'Computer Science & Engineering';
      subject = facRows[0].subject;
      scheme = facRows[0].scheme;
      semester = facRows[0].semester || user.semester || null;
    } else if (user.role === 'hod') {
      department = 'Computer Science & Engineering';
    }
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.user_id, role: user.role, name: user.full_name, email: user.email, student_id, faculty_id, subject, scheme },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  audit.log(user.user_id, 'LOGIN_OTP_VERIFIED', 'users', user.user_id, 'User verified OTP and logged in', req.ip);

  res.json({
    token,
    user: { id: user.user_id, name: user.full_name, email: user.email, role: user.role, usn, emp_code, department, subject, scheme }
  });
};

exports.signup = async (req, res) => {
  const { full_name, email, password, role, phone, usn, emp_code, department, semester, scheme, subject, cycle } = req.body;

  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required' });
  }

  let cleanEmail;
  try {
    cleanEmail = normalizeAndValidateEmail(email);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  // Check if active user already exists with this email
  const [existing] = await db.execute('SELECT user_id, is_active FROM users WHERE email=?', [cleanEmail]);
  if (existing.length) {
    const ex = existing[0];
    if (ex.is_active) {
      return res.status(409).json({ message: 'Email already registered. Please sign in instead.' });
    }
    // Clean up previous unverified account to allow fresh signup
    await db.execute('DELETE FROM faculty WHERE user_id=?', [ex.user_id]).catch(() => {});
    await db.execute('DELETE FROM students WHERE user_id=?', [ex.user_id]).catch(() => {});
    await db.execute('DELETE FROM users WHERE user_id=?', [ex.user_id]).catch(() => {});
  }

  // Role-specific validation & unverified duplicate cleanup
  if (role === 'student') {
    if (!usn) {
      return res.status(400).json({ message: 'USN is required for student registration' });
    }
    const usnRegex = /^4PM\d{2}[A-Za-z]{2}\d{3}$/i;
    if (!usnRegex.test(usn.trim())) {
      return res.status(400).json({ message: 'Invalid USN format. USN must follow college code 4PM format (e.g. 4PM22CS001)' });
    }

    const [usnRows] = await db.execute(
      'SELECT s.user_id, u.is_active FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.usn=?',
      [usn.trim().toUpperCase()]
    );
    if (usnRows.length) {
      const activeUsn = usnRows.find(r => r.is_active);
      if (activeUsn) {
        return res.status(409).json({ message: 'USN is already registered to an active account.' });
      }
      for (const r of usnRows) {
        await db.execute('DELETE FROM students WHERE user_id=?', [r.user_id]).catch(() => {});
        await db.execute('DELETE FROM users WHERE user_id=?', [r.user_id]).catch(() => {});
      }
    }
  }

  if (role === 'faculty') {
    if (!emp_code) {
      return res.status(400).json({ message: 'Employee code is required for faculty registration' });
    }
    if (!subject) {
      return res.status(400).json({ message: 'Assigned subject is required for faculty registration' });
    }

    const [empRows] = await db.execute(
      'SELECT f.user_id, u.is_active FROM faculty f JOIN users u ON f.user_id = u.user_id WHERE f.emp_code=?',
      [emp_code.trim()]
    );
    if (empRows.length) {
      const activeEmp = empRows.find(r => r.is_active);
      if (activeEmp) {
        return res.status(409).json({ message: 'Employee code is already registered to an active account.' });
      }
      for (const r of empRows) {
        await db.execute('DELETE FROM faculty WHERE user_id=?', [r.user_id]).catch(() => {});
        await db.execute('DELETE FROM users WHERE user_id=?', [r.user_id]).catch(() => {});
      }
    }
  }

  const conn = await db.getConnection();
  try {
    const hash = await bcrypt.hash(password, 10);
    await conn.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(120)').catch(() => {});

    const dept = department || 'Computer Science & Engineering';

    const schemeYear = (scheme || '2022').replace(/\D/g, '') || '2022';
    const [schRows] = await conn.query(
      `SELECT s.scheme_id AS id 
       FROM subjects s 
       JOIN schemes sch ON s.scheme_id = sch.id 
       WHERE sch.name = ? OR sch.name LIKE ? OR sch.year_label = ?
       LIMIT 1`,
      [schemeYear, `${schemeYear}%`, schemeYear]
    );
    const schemeId = schRows && schRows[0] 
      ? schRows[0].id 
      : ((await conn.query('SELECT id FROM schemes WHERE name = ? OR name LIKE ? ORDER BY id DESC LIMIT 1', [schemeYear, `${schemeYear}%`]))[0]?.[0]?.id || null);
    let semVal = 1;
    let cycleVal = cycle ? String(cycle).trim().toUpperCase() : null;
    if (typeof semester === 'string') {
      if (semester.includes('1')) semVal = 1;
      else if (semester.includes('2')) semVal = 2;
      else if (semester.includes('3')) semVal = 3;
      else if (semester.includes('4')) semVal = 4;
      else if (semester.includes('5')) semVal = 5;
      else if (semester.includes('6')) semVal = 6;
      else if (semester.includes('7')) semVal = 7;
      else if (semester.includes('8')) semVal = 8;
      else semVal = parseInt(semester) || 1;

      if (!cycleVal) {
        if (semester.includes('-P') || semester.includes('_P') || semester.includes('P-Cycle') || semester.includes('P Cycle') || semester.includes('(P-Cycle)')) {
          cycleVal = 'P';
        } else if (semester.includes('-C') || semester.includes('_C') || semester.includes('C-Cycle') || semester.includes('C Cycle') || semester.includes('(C-Cycle)')) {
          cycleVal = 'C';
        }
      }
    } else if (semester) {
      semVal = parseInt(semester) || 1;
    }
    if (cycleVal) {
      cycleVal = cycleVal.includes('P') ? 'P' : cycleVal.includes('C') ? 'C' : null;
    }
    if ((semVal === 1 || semVal === 2) && !cycleVal) {
      cycleVal = 'P';
    } else if (semVal > 2) {
      cycleVal = null;
    }

    // Create user with is_active=false (pending email verification)
    const [r] = await conn.query(
      'INSERT INTO users (full_name, email, password_hash, role, phone, department, is_active, scheme_id, dept, semester, cycle) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [full_name, cleanEmail, hash, role, phone || null, dept, false, schemeId, dept, semVal, cycleVal]
    );
    const userId = r.insertId;

    if (role === 'student') {
      await conn.query(
        'INSERT INTO students (user_id, usn, department, semester, section, batch_year, scheme, cycle) VALUES (?,?,?,?,?,?,?,?)',
        [userId, usn.trim().toUpperCase(), dept, semVal, 'A', new Date().getFullYear(), scheme || '2022 Scheme', cycleVal]
      );
    } else if (role === 'faculty' || role === 'hod') {
      const code = emp_code ? emp_code.trim() : (role === 'hod' ? `HOD${userId}` : `FAC${userId}`);
      await conn.query(
        'INSERT INTO faculty (user_id, emp_code, department, designation, specialization, subject, scheme, semester) VALUES (?,?,?,?,?,?,?,?)',
        [userId, code, dept, role === 'hod' ? 'Professor & HOD' : 'Assistant Professor', subject || 'Computer Networks Lab', subject || 'Computer Networks Lab', scheme || '2022 Scheme', semVal]
      );
    }

    // Generate secure 6-digit OTP & SHA-256 Hash
    const otp = generateSecureOtp();
    const otpHash = hashOtp(otp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await conn.query('DELETE FROM signup_otps WHERE email=?', [cleanEmail]);
    await conn.query(
      'INSERT INTO signup_otps (email, otp_hash, resend_count, attempts, expires_at, last_sent_at) VALUES (?,?,?,?, ?, CURRENT_TIMESTAMP)',
      [cleanEmail, otpHash, 1, 0, otpExpires]
    );

    // Send verification email via Gmail SMTP
    let emailResult;
    try {
      emailResult = await sendMail({
        to: cleanEmail,
        subject: 'Your PESITM Smart Lab verification code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #2563eb; margin: 0; font-size: 22px;">PESITM Smart Lab Management</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">College of Engineering & Technology</p>
            </div>
            <p style="color: #334155; font-size: 15px;">Hi <strong>${full_name}</strong>,</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.5;">Thank you for registering on PESITM Smart Lab. Use the 6-digit verification code below to complete your account activation:</p>
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e293b;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px; margin-bottom: 5px;">• Code expires in <strong>10 minutes</strong>.</p>
            <p style="color: #64748b; font-size: 13px; margin-top: 0;">• If you don't see this in your inbox, please check your <strong>Spam / Junk folder</strong>.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">PESITM Smart Lab System &copy; 2026. Automated message — please do not reply.</p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error(`❌ [SIGNUP EMAIL FAILED] Could not send code to ${cleanEmail}:`, mailErr.message);
      return res.status(503).json({
        message: 'Email service is currently unavailable. Please check your network connection or try again in a few moments.',
      });
    }

    res.status(201).json({
      message: 'Verification code sent to your email. Please check your inbox or spam folder.',
      email: cleanEmail,
      provider: emailResult?.provider,
    });
  } catch (e) {
    if (e.code === '23505' || e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email or USN/Employee code already in use' });
    }
    console.error('Signup error:', e);
    res.status(500).json({ message: e.message || 'Signup failed' });
  } finally {
    conn.release();
  }
};

exports.verifySignupCode = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and 6-digit verification code are required' });
  }

  let cleanEmail;
  try {
    cleanEmail = normalizeAndValidateEmail(email);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  const cleanOtp = String(otp).trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    return res.status(400).json({ message: 'Verification code must be a 6-digit number' });
  }

  const [otpRows] = await db.execute('SELECT * FROM signup_otps WHERE email=?', [cleanEmail]);
  if (!otpRows.length) {
    return res.status(400).json({ message: 'No active verification code found. Please request a new code.' });
  }

  const record = otpRows[0];
  const now = new Date();

  // 1. Check Expiry (10 min)
  if (new Date(record.expires_at) < now) {
    await db.execute('DELETE FROM signup_otps WHERE email=?', [cleanEmail]);
    return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
  }

  // 2. Check Max Attempts (Max 5)
  const currentAttempts = Number(record.attempts || 0);
  if (currentAttempts >= 5) {
    await db.execute('DELETE FROM signup_otps WHERE email=?', [cleanEmail]);
    return res.status(400).json({ message: 'Maximum verification attempts (5) exceeded. Please request a new code.' });
  }

  // Increment attempts counter
  await db.execute('UPDATE signup_otps SET attempts = attempts + 1 WHERE email=?', [cleanEmail]);

  // 3. Verify SHA-256 Hash
  const isMatch = verifyOtpHash(cleanOtp, record.otp_hash);
  if (!isMatch) {
    const remainingAttempts = 5 - (currentAttempts + 1);
    return res.status(400).json({
      message: `Invalid 6-digit verification code. (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining)`,
      remainingAttempts,
    });
  }

  // Success! Delete OTP record & activate account
  await db.execute('UPDATE users SET is_active=true WHERE email=?', [cleanEmail]);
  await db.execute('DELETE FROM signup_otps WHERE email=?', [cleanEmail]);

  // Fetch activated user details & generate JWT token
  const [userRows] = await db.execute('SELECT * FROM users WHERE email=?', [cleanEmail]);
  if (!userRows.length) {
    return res.status(404).json({ message: 'User account not found' });
  }

  const user = userRows[0];
  let usn = null;
  let emp_code = null;
  let department = null;
  let student_id = null;
  let faculty_id = null;
  let scheme = null;
  let semester = null;
  let cycle = null;
  if (user.role === 'student') {
    const [stdRows] = await db.execute('SELECT student_id, usn, department, semester, scheme, cycle FROM students WHERE user_id=?', [user.user_id]);
    if (stdRows.length) {
      student_id = stdRows[0].student_id;
      usn = stdRows[0].usn;
      department = stdRows[0].department;
      semester = stdRows[0].semester;
      scheme = stdRows[0].scheme;
      cycle = stdRows[0].cycle || user.cycle || null;
    }
  } else if (user.role === 'faculty' || user.role === 'hod') {
    const [facRows] = await db.execute('SELECT faculty_id, emp_code, department, subject, scheme, semester FROM faculty WHERE user_id=?', [user.user_id]);
    if (facRows.length) {
      faculty_id = facRows[0].faculty_id;
      emp_code = facRows[0].emp_code;
      department = facRows[0].department || 'Computer Science & Engineering';
      subject = facRows[0].subject;
      scheme = facRows[0].scheme;
      semester = facRows[0].semester || user.semester || null;
    } else if (user.role === 'hod') {
      department = 'Computer Science & Engineering';
    }
  }

  const token = jwt.sign(
    { id: user.user_id, role: user.role, name: user.full_name, email: user.email, student_id, faculty_id, scheme, semester, cycle },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );

  audit.log(user.user_id, 'SIGNUP_VERIFIED', 'users', user.user_id, 'User verified email and activated account', req.ip);

  res.json({
    token,
    user: { id: user.user_id, name: user.full_name, email: user.email, role: user.role, usn, emp_code, department, scheme, semester, cycle }
  });
};

exports.resendCode = async (req, res) => {
  const { email, type } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  let cleanEmail;
  try {
    cleanEmail = normalizeAndValidateEmail(email);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  const tableName = type === 'signup' ? 'signup_otps' : 'login_otps';

  const [existing] = await db.execute(
    `SELECT otp_hash, resend_count, attempts, expires_at, last_sent_at, created_at FROM ${tableName} WHERE email=?`,
    [cleanEmail]
  );

  if (existing.length) {
    const rec = existing[0];
    const now = new Date();

    // 1. 60s resend cooldown check
    if (rec.last_sent_at) {
      const secondsSinceLast = (now.getTime() - new Date(rec.last_sent_at).getTime()) / 1000;
      if (secondsSinceLast < 60) {
        const remainingSec = Math.ceil(60 - secondsSinceLast);
        return res.status(429).json({
          message: `Please wait ${remainingSec} second${remainingSec === 1 ? '' : 's'} before requesting another code.`,
          cooldownRemaining: remainingSec,
        });
      }
    }

    // 2. 15-minute window rate limiting (max 3 sends per 15 minutes)
    const minutesSinceCreated = (now.getTime() - new Date(rec.created_at || now).getTime()) / (1000 * 60);
    if (minutesSinceCreated <= 15 && Number(rec.resend_count || 0) >= 3) {
      return res.status(429).json({
        message: 'Maximum resend limit reached (3 codes per 15 minutes). Please check your inbox/spam folder or try again later.',
      });
    }
  }

  const resendCount = existing.length ? Number(existing[0].resend_count || 0) + 1 : 1;
  const otp = generateSecureOtp();
  const otpHash = hashOtp(otp);
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  const [users] = await db.execute('SELECT full_name, user_id FROM users WHERE email=?', [cleanEmail]);
  const fullName = users.length ? users[0].full_name : 'User';

  await db.execute(`DELETE FROM ${tableName} WHERE email=?`, [cleanEmail]);
  await db.execute(
    `INSERT INTO ${tableName} (email, otp_hash, resend_count, attempts, expires_at, last_sent_at) VALUES (?,?,?,?, ?, CURRENT_TIMESTAMP)`,
    [cleanEmail, otpHash, resendCount, 0, otpExpires]
  );

  try {
    const emailResult = await sendMail({
      to: cleanEmail,
      subject: 'Your PESITM Smart Lab verification code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin: 0; font-size: 22px;">PESITM Smart Lab Management</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">College of Engineering & Technology</p>
          </div>
          <p style="color: #334155; font-size: 15px;">Hi <strong>${fullName}</strong>,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.5;">Here is your new 6-digit verification code:</p>
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e293b;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 5px;">• Code expires in <strong>10 minutes</strong>.</p>
          <p style="color: #64748b; font-size: 13px; margin-top: 0;">• Check your <strong>Spam / Junk folder</strong> if not in primary inbox.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">PESITM Smart Lab System &copy; 2026.</p>
        </div>
      `,
    });

    audit.log(users[0]?.user_id || 0, 'RESEND_OTP', 'users', users[0]?.user_id || 0, `Resent OTP code (${resendCount}/3) to ${cleanEmail}`, req.ip);

    const remaining = Math.max(0, 3 - resendCount);
    res.json({
      message: `New verification code sent to your email. (${remaining} resend attempt${remaining === 1 ? '' : 's'} left)`,
      resendCount,
      remainingResends: remaining,
      provider: emailResult?.provider,
    });
  } catch (err) {
    console.error('Failed to resend code:', err);
    res.status(503).json({ message: err.message || 'Email service unavailable. Please try again in a few moments.' });
  }
};
