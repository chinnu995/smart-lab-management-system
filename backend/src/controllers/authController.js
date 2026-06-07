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
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  let rows = [];
  if (email && email.includes('@')) {
    const [emailRows] = await db.execute('SELECT * FROM users WHERE email=? AND is_active=1', [email]);
    rows = emailRows;
  } else {
    const [usnRows] = await db.execute(
      'SELECT u.* FROM users u JOIN students s ON u.user_id = s.user_id WHERE s.usn=? AND u.is_active=1',
      [email]
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
    { expiresIn: JWT_EXPIRES }
  );
  audit.log(user.user_id, 'LOGIN', 'users', user.user_id, 'User logged in', req.ip);
  res.json({
    token,
    user: { id: user.user_id, name: user.full_name, email: user.email, role: user.role, usn, emp_code, department }
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
    const [r] = await db.execute(
      'INSERT INTO users (full_name,email,password_hash,role,phone) VALUES (?,?,?,?,?)',
      [full_name, email, hash, role, phone || null]
    );
    audit.log(req.user.id, 'REGISTER_USER', 'users', r.insertId, `Created ${role}: ${email}`, req.ip);
    res.status(201).json({ id: r.insertId, message: 'User created' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already in use' });
    res.status(500).json({ message: e.message });
  }
};

exports.me = async (req, res) => {
  const [rows] = await db.execute(
    'SELECT u.user_id, u.full_name, u.email, u.role, u.phone, u.profile_image, s.usn, s.department AS student_dept, f.emp_code, f.department AS faculty_dept FROM users u LEFT JOIN students s ON u.user_id = s.user_id LEFT JOIN faculty f ON u.user_id = f.user_id WHERE u.user_id=?',
    [req.user.id]
  );
  const u = rows[0] || null;
  if (u) {
    u.department = u.role === 'student' ? u.student_dept : u.role === 'faculty' ? u.faculty_dept : 'Computer Science & Engineering';
    delete u.student_dept;
    delete u.faculty_dept;
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
    res.json({ message: 'A password reset link has been sent to your email.' });
  } catch (err) {
    console.error('Failed to send reset email:', err);
    res.status(500).json({ message: 'Failed to send password reset link email. Please check your SMTP configuration.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const [rows] = await db.execute(
    'SELECT user_id FROM users WHERE reset_token=? AND reset_expires>NOW()', [token]
  );
  if (!rows.length) return res.status(400).json({ message: 'Invalid or expired token' });
  const hash = await bcrypt.hash(password, 10);
  await db.execute(
    'UPDATE users SET password_hash=?, reset_token=NULL, reset_expires=NULL WHERE user_id=?',
    [hash, rows[0].user_id]
  );
  res.json({ message: 'Password updated' });
};

// Google Login has been removed as per HOD configuration requirements

exports.verifyCode = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and verification code required' });
  }

  // Verify OTP
  const [otpRows] = await db.execute(
    'SELECT * FROM login_otps WHERE email=? AND otp=? AND expires_at > NOW()',
    [email, otp]
  );

  if (!otpRows.length) {
    return res.status(401).json({ message: 'Invalid or expired verification code' });
  }

  // OTP verified, get user details
  const [userRows] = await db.execute('SELECT * FROM users WHERE email=? AND is_active=1', [email]);
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

  // Generate JWT token
  const token = jwt.sign(
    { id: user.user_id, role: user.role, name: user.full_name, email: user.email, student_id, faculty_id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  audit.log(user.user_id, 'LOGIN_OTP_VERIFIED', 'users', user.user_id, 'User verified OTP and logged in', req.ip);

  res.json({
    token,
    user: { id: user.user_id, name: user.full_name, email: user.email, role: user.role, usn, emp_code, department }
  });
};

exports.signup = async (req, res) => {
  const { full_name, email, password, role, phone, usn, emp_code, department, semester } = req.body;

  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required' });
  }

  // Check if email already exists
  const [existing] = await db.execute('SELECT user_id FROM users WHERE email=?', [email]);
  if (existing.length) {
    return res.status(409).json({ message: 'Email already registered. Please sign in instead.' });
  }

  // Role-specific validation
  if (role === 'student' && !usn) {
    return res.status(400).json({ message: 'USN is required for student registration' });
  }
  if (role === 'faculty' && !emp_code) {
    return res.status(400).json({ message: 'Employee code is required for faculty registration' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const hash = await bcrypt.hash(password, 10);

    // Create user with is_active=false (pending email verification)
    const [r] = await conn.execute(
      'INSERT INTO users (full_name, email, password_hash, role, phone, is_active) VALUES (?,?,?,?,?,?)',
      [full_name, email, hash, role, phone || null, false]
    );
    const userId = r.insertId;

    const dept = department || 'Computer Science';

    // Create role-specific record
    if (role === 'student') {
      await conn.execute(
        'INSERT INTO students (user_id, usn, department, semester, section, batch_year) VALUES (?,?,?,?,?,?)',
        [userId, usn, dept, semester || 1, 'A', new Date().getFullYear()]
      );
    } else if (role === 'faculty') {
      await conn.execute(
        'INSERT INTO faculty (user_id, emp_code, department, designation) VALUES (?,?,?,?)',
        [userId, emp_code, dept, 'Assistant Professor']
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create signup_otps table if not exists
    await conn.execute(`CREATE TABLE IF NOT EXISTS signup_otps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(120) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await conn.execute('DELETE FROM signup_otps WHERE email=?', [email]);
    await conn.execute('INSERT INTO signup_otps (email, otp, expires_at) VALUES (?,?,?)',
      [email, otp, otpExpires]);

    await conn.commit();

    try {
      await sendMail({
        to: email,
        subject: 'Smart Lab — Email Verification Code',
        html: `<p>Hi ${full_name},</p><p>Your verification code is: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
      });
      res.status(201).json({ message: 'Verification code sent to your email.', email });
    } catch (err) {
      console.error('Failed to send verification email:', err);
      throw new Error('Failed to send verification email. Please check your SMTP configuration or network.');
    }
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') {
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
    'SELECT * FROM signup_otps WHERE email=? AND otp=? AND expires_at > NOW()',
    [email, otp]
  );

  if (!otpRows.length) {
    return res.status(401).json({ message: 'Invalid or expired verification code' });
  }

  // Activate the user account
  await db.execute('UPDATE users SET is_active=1 WHERE email=?', [email]);
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
