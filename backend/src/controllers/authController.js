const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const audit = require('../utils/audit');
const { sendMail } = require('../utils/mailer');

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
  if (user.role === 'student') {
    const [stdRows] = await db.execute('SELECT student_id, usn, department, scheme FROM students WHERE user_id=?', [user.user_id]);
    if (stdRows.length) {
      student_id = stdRows[0].student_id;
      usn = stdRows[0].usn;
      department = stdRows[0].department;
      scheme = stdRows[0].scheme;
    }
  } else if (user.role === 'faculty') {
    const [facRows] = await db.execute('SELECT faculty_id, emp_code, department, subject, scheme FROM faculty WHERE user_id=?', [user.user_id]);
    if (facRows.length) {
      faculty_id = facRows[0].faculty_id;
      emp_code = facRows[0].emp_code;
      department = facRows[0].department;
      subject = facRows[0].subject;
      scheme = facRows[0].scheme;
    }
  } else if (user.role === 'hod') {
    department = 'Computer Science & Engineering';
  }

  const token = jwt.sign(
    { id: user.user_id, role: user.role, name: user.full_name, email: user.email, student_id, faculty_id, subject, scheme },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  audit.log(user.user_id, 'USER_LOGIN', 'users', user.user_id, 'User logged in', req.ip);

  res.json({
    token,
    user: { id: user.user_id, name: user.full_name, email: user.email, role: user.role, usn, emp_code, department, subject, scheme }
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
  const [rows] = await db.execute(
    'SELECT u.user_id, u.full_name, u.email, u.role, u.phone, u.profile_image, s.usn, s.department AS student_dept, s.scheme AS student_scheme, f.emp_code, f.department AS faculty_dept, f.subject AS faculty_subject, f.scheme AS faculty_scheme FROM users u LEFT JOIN students s ON u.user_id = s.user_id LEFT JOIN faculty f ON u.user_id = f.user_id WHERE u.user_id=?',
    [req.user.id]
  );
  const u = rows[0] || null;
  if (u) {
    u.department = u.role === 'student' ? u.student_dept : u.role === 'faculty' ? u.faculty_dept : 'Computer Science & Engineering';
    u.scheme = u.role === 'student' ? u.student_scheme : u.faculty_scheme;
    u.subject = u.faculty_subject || null;
    delete u.student_dept;
    delete u.faculty_dept;
    delete u.student_scheme;
    delete u.faculty_scheme;
  }
  res.json(u);
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
  } else if (user.role === 'faculty') {
    const [facRows] = await db.execute('SELECT faculty_id, emp_code, department, subject, scheme FROM faculty WHERE user_id=?', [user.user_id]);
    if (facRows.length) {
      faculty_id = facRows[0].faculty_id;
      emp_code = facRows[0].emp_code;
      department = facRows[0].department;
      subject = facRows[0].subject;
      scheme = facRows[0].scheme;
    }
  } else if (user.role === 'hod') {
    department = 'Computer Science & Engineering';
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
  const { full_name, email, password, role, phone, usn, emp_code, department, semester, scheme, subject } = req.body;

  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required' });
  }

  // Check if active user already exists with this email
  const [existing] = await db.execute('SELECT user_id, is_active FROM users WHERE email=?', [email]);
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

    // Check if USN belongs to an active vs unverified user
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

    // Check if emp_code belongs to an active vs unverified user
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

    // Create user with is_active=false (pending email verification)
    const [r] = await conn.query(
      'INSERT INTO users (full_name, email, password_hash, role, phone, is_active) VALUES (?,?,?,?,?,?)',
      [full_name, email, hash, role, phone || null, false]
    );
    const userId = r.insertId;

    const dept = department || 'Computer Science & Engineering';

    // Create role-specific record
    if (role === 'student') {
      await conn.query(
        'INSERT INTO students (user_id, usn, department, semester, section, batch_year, scheme) VALUES (?,?,?,?,?,?,?)',
        [userId, usn.trim().toUpperCase(), dept, semester || 1, 'A', new Date().getFullYear(), scheme || '2022 Scheme']
      );
    } else if (role === 'faculty') {
      await conn.query(
        'INSERT INTO faculty (user_id, emp_code, department, designation, specialization, subject, scheme) VALUES (?,?,?,?,?,?,?)',
        [userId, emp_code.trim(), dept, 'Assistant Professor', subject, subject, scheme || '2022 Scheme']
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await conn.query(`CREATE TABLE IF NOT EXISTS signup_otps (
      email VARCHAR(191) PRIMARY KEY,
      otp VARCHAR(10) NOT NULL,
      resend_count INT DEFAULT 0,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`).catch(() => {});

    await conn.query('DELETE FROM signup_otps WHERE email=?', [email]);
    await conn.query('INSERT INTO signup_otps (email, otp, expires_at) VALUES (?,?,?)',
      [email, otp, otpExpires]);

    try {
      await sendMail({
        to: email,
        subject: 'Smart Lab — Email Verification Code',
        html: `<p>Hi ${full_name},</p><p>Your verification code is: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
      });
    } catch (err) {
      console.error('Failed to send verification email (dev fallback):', err.message);
      console.log(`[DEV OTP FALLBACK] Verification code for ${email}: ${otp}`);
    }

    res.status(201).json({
      message: 'Verification code sent to your email.',
      email,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (e) {
    if (e.code === '23505' || e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email or USN/Employee code already in use' });
    }
    console.error('Signup error:', e);
    res.status(500).json({ message: e.message });
  } finally {
    conn.release();
  }
};

exports.verifySignupCode = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and verification code are required' });
  }

  const [otpRows] = await db.execute(
    'SELECT * FROM signup_otps WHERE email=? AND otp=? AND expires_at > CURRENT_TIMESTAMP',
    [email, otp]
  );

  if (!otpRows.length) {
    return res.status(401).json({ message: 'Invalid or expired verification code' });
  }

  // Activate the user account
  await db.execute('UPDATE users SET is_active=true WHERE email=?', [email]);
  await db.execute('DELETE FROM signup_otps WHERE email=?', [email]);

  // Get user and generate JWT
  const [userRows] = await db.execute('SELECT * FROM users WHERE email=?', [email]);
  if (!userRows.length) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = userRows[0];

  let usn = null;
  let emp_code = null;
  let department = null;
  let student_id = null;
  let faculty_id = null;
  if (user.role === 'student') {
    const [stdRows] = await db.execute('SELECT student_id, usn, department FROM students WHERE user_id=?', [user.user_id]);
    if (stdRows.length) {
      student_id = stdRows[0].student_id;
      usn = stdRows[0].usn;
      department = stdRows[0].department;
    }
  } else if (user.role === 'faculty') {
    const [facRows] = await db.execute('SELECT faculty_id, emp_code, department FROM faculty WHERE user_id=?', [user.user_id]);
    if (facRows.length) {
      faculty_id = facRows[0].faculty_id;
      emp_code = facRows[0].emp_code;
      department = facRows[0].department;
    }
  } else if (user.role === 'hod') {
    department = 'Computer Science & Engineering';
  }

  const token = jwt.sign(
    { id: user.user_id, role: user.role, name: user.full_name, email: user.email, student_id, faculty_id },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );

  audit.log(user.user_id, 'SIGNUP_VERIFIED', 'users', user.user_id, 'User verified email and activated account', req.ip);

  res.json({
    token,
    user: { id: user.user_id, name: user.full_name, email: user.email, role: user.role, usn, emp_code, department }
  });
};

exports.resendCode = async (req, res) => {
  const { email, type } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  const tableName = type === 'signup' ? 'signup_otps' : 'login_otps';
  
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS ${tableName} (
      email VARCHAR(191) PRIMARY KEY,
      otp VARCHAR(10) NOT NULL,
      resend_count INT DEFAULT 0,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`).catch(() => {});
    await db.execute(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS resend_count INT DEFAULT 0`).catch(() => {});
  } catch (err) {
    // table exists
  }

  let currentCount = 0;
  try {
    const [rows] = await db.execute(`SELECT resend_count FROM ${tableName} WHERE email=?`, [email]);
    if (rows.length && rows[0].resend_count !== null && rows[0].resend_count !== undefined) {
      currentCount = Number(rows[0].resend_count);
    }
  } catch (err) {
    currentCount = 0;
  }

  if (currentCount >= 3) {
    return res.status(429).json({ message: 'Maximum resend limit reached (3 times). Please check your inbox or try signing in again.' });
  }

  const nextCount = currentCount + 1;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  const [users] = await db.execute('SELECT full_name, user_id FROM users WHERE email=?', [email]);
  const fullName = users.length ? users[0].full_name : 'User';

  await db.execute(`DELETE FROM ${tableName} WHERE email=?`, [email]);
  await db.execute(`INSERT INTO ${tableName} (email, otp, resend_count, expires_at) VALUES (?,?,?,?)`,
    [email, otp, nextCount, otpExpires]);

  try {
    await sendMail({
      to: email,
      subject: 'Smart Lab — New Verification Code',
      html: `<p>Hi ${fullName},</p><p>Your new verification code is: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
    });
  } catch (err) {
    console.error('Failed to send resend email:', err);
  }

  audit.log(users[0]?.user_id || 0, 'RESEND_OTP', 'users', users[0]?.user_id || 0, `Resent OTP code (${nextCount}/3) to ${email}`, req.ip);

  const remaining = 3 - nextCount;
  res.json({
    message: `New verification code sent to your email. (${remaining} resend attempt${remaining === 1 ? '' : 's'} left)`,
    resendCount: nextCount,
    remainingResends: remaining
  });
};
