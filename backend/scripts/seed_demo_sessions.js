require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

async function seedDemoData() {
  try {
    console.log('🌱 Seeding demo accounts and lab session data...');
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Ensure Labs exist
    const labsList = [
      { name: 'DBMS Lab', code: 'CL01', location: '2F 02' },
      { name: 'Java Lab', code: 'CL02', location: 'NBGF 12' },
      { name: 'Python Lab', code: 'CL03', location: '3F 28' },
    ];

    const labIds = {};
    for (const l of labsList) {
      let [existing] = await db.query('SELECT lab_id FROM labs WHERE lab_name = ? OR lab_code = ?', [l.name, l.code]);
      if (existing.length === 0) {
        const [res] = await db.query(
          "INSERT INTO labs (lab_name, lab_code, location, capacity, status) VALUES (?, ?, ?, 40, 'available')",
          [l.name, l.code, l.location]
        );
        labIds[l.name] = res.insertId;
      } else {
        labIds[l.name] = existing[0].lab_id;
        await db.query('UPDATE labs SET location = ? WHERE lab_id = ?', [l.location, existing[0].lab_id]);
      }
    }

    await db.query("UPDATE labs SET location = '2F 01' WHERE UPPER(lab_name) LIKE '%ADA%'");
    await db.query("UPDATE labs SET location = '2F 02' WHERE UPPER(lab_name) LIKE '%DBMS%'");
    await db.query("UPDATE labs SET location = '2F 03' WHERE UPPER(lab_name) LIKE '%LATEX%'");
    await db.query("UPDATE labs SET location = '1F 05' WHERE UPPER(lab_name) LIKE '%MICRO%'");
    await db.query("UPDATE labs SET location = '1F 06' WHERE UPPER(lab_name) LIKE '%MONGO%'");
    await db.query("UPDATE labs SET location = '3F 28' WHERE UPPER(lab_name) LIKE '%AI%' OR UPPER(lab_name) LIKE '%PYTHON%'");
    await db.query("UPDATE labs SET location = 'NBGF 12' WHERE UPPER(lab_name) LIKE '%JAVA%'");
    await db.query("UPDATE labs SET location = '1F 09' WHERE UPPER(lab_name) LIKE '%C %' OR UPPER(lab_name) = 'C' OR UPPER(lab_name) = 'C LANGUAGE'");
    await db.query("UPDATE labs SET location = '1F 10' WHERE UPPER(lab_name) LIKE '%DSA%' OR UPPER(lab_name) LIKE '%DATA STRUCTURE%'");

    // 2. Ensure Faculty Users
    const facultyList = [
      { email: 'faculty@lab.edu', name: 'Faculty A', emp_code: 'F001', subject: 'DBMS Lab', dept: 'Computer Science & Engineering' },
      { email: 'faculty_a@lab.edu', name: 'Faculty A', emp_code: 'F001A', subject: 'DBMS Lab', dept: 'Computer Science & Engineering' },
      { email: 'faculty_b@lab.edu', name: 'Faculty B', emp_code: 'F002', subject: 'Java Lab', dept: 'Computer Science & Engineering' },
      { email: 'faculty_c@lab.edu', name: 'Faculty C', emp_code: 'F003', subject: 'Python Lab', dept: 'Computer Science & Engineering' },
    ];

    const facultyMap = {};
    for (const f of facultyList) {
      let [existingUser] = await db.query('SELECT user_id FROM users WHERE email = ?', [f.email]);
      let userId;
      if (existingUser.length === 0) {
        const [uRes] = await db.query(
          "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'faculty')",
          [f.name, f.email, passwordHash]
        );
        userId = uRes.insertId;
      } else {
        userId = existingUser[0].user_id;
        await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [passwordHash, userId]);
      }

      let [existingFac] = await db.query('SELECT faculty_id FROM faculty WHERE user_id = ?', [userId]);
      let facId;
      if (existingFac.length === 0) {
        const [fRes] = await db.query(
          'INSERT INTO faculty (user_id, emp_code, department, subject) VALUES (?, ?, ?, ?)',
          [userId, f.emp_code, f.dept, f.subject]
        );
        facId = fRes.insertId;
      } else {
        facId = existingFac[0].faculty_id;
        await db.query('UPDATE faculty SET subject = ? WHERE faculty_id = ?', [f.subject, facId]);
      }
      facultyMap[f.email] = facId;
    }

    // 3. Ensure Student Users
    const studentList = [
      { email: 'student@lab.edu', name: 'Student CSE-A', usn: '1VA21CS001', section: 'CSE-A', dept: 'Computer Science & Engineering' },
      { email: 'student_a1@lab.edu', name: 'Student A1', usn: '1VA21CS002', section: 'CSE-A', dept: 'Computer Science & Engineering' },
      { email: 'student_b1@lab.edu', name: 'Student B1', usn: '1VA21CS050', section: 'CSE-B', dept: 'Computer Science & Engineering' },
      { email: 'student_c1@lab.edu', name: 'Student C1', usn: '1VA21CS100', section: 'CSE-C', dept: 'Computer Science & Engineering' },
    ];

    for (const s of studentList) {
      let [existingUser] = await db.query('SELECT user_id FROM users WHERE email = ?', [s.email]);
      let userId;
      if (existingUser.length === 0) {
        const [uRes] = await db.query(
          "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'student')",
          [s.name, s.email, passwordHash]
        );
        userId = uRes.insertId;
      } else {
        userId = existingUser[0].user_id;
        await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [passwordHash, userId]);
      }

      let [existingStu] = await db.query('SELECT student_id FROM students WHERE user_id = ?', [userId]);
      if (existingStu.length === 0) {
        await db.query(
          'INSERT INTO students (user_id, usn, department, semester, section) VALUES (?, ?, ?, 5, ?)',
          [userId, s.usn, s.dept, s.section]
        );
      } else {
        await db.query('UPDATE students SET section = ?, department = ? WHERE user_id = ?', [s.section, s.dept, userId]);
      }
    }

    console.log('✅ Demo accounts & lab session requirements initialized successfully!');
  } catch (err) {
    console.error('Error seeding demo data:', err);
  } finally {
    process.exit(0);
  }
}

seedDemoData();
