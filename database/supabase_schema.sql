-- =====================================================================
-- SMART LAB MANAGEMENT SYSTEM - Supabase / PostgreSQL Schema
-- Author: Chinmay Hegde and Team
-- =====================================================================

-- Drop existing tables/views/functions if re-running
DROP VIEW IF EXISTS v_lab_heatmap CASCADE;
DROP VIEW IF EXISTS v_student_attendance_pct CASCADE;

DROP TABLE IF EXISTS test_submissions CASCADE;
DROP TABLE IF EXISTS test_questions CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS chatbot_logs CASCADE;
DROP TABLE IF EXISTS experiments CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS announcement_reads CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS face_attendance CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS equipment_requests CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS labs CASCADE;
DROP TABLE IF EXISTS parent_details CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS login_otps CASCADE;
DROP TABLE IF EXISTS signup_otps CASCADE;

-- ---------------------------------------------------------------------
-- USERS (base table for auth)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  user_id        SERIAL PRIMARY KEY,
  full_name      VARCHAR(120) NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           VARCHAR(20) NOT NULL CHECK (role IN ('student','faculty','hod')),
  phone          VARCHAR(20),
  profile_image  VARCHAR(255),
  is_active      BOOLEAN DEFAULT TRUE,
  reset_token    VARCHAR(255),
  reset_expires  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- STUDENTS
-- ---------------------------------------------------------------------
CREATE TABLE students (
  student_id     SERIAL PRIMARY KEY,
  user_id        INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  usn            VARCHAR(30) NOT NULL UNIQUE,
  department     VARCHAR(80) NOT NULL,
  semester       INT NOT NULL,
  section        VARCHAR(5),
  batch_year     INT,
  face_encoding  TEXT
);

-- ---------------------------------------------------------------------
-- FACULTY
-- ---------------------------------------------------------------------
CREATE TABLE faculty (
  faculty_id   SERIAL PRIMARY KEY,
  user_id      INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  emp_code     VARCHAR(30) NOT NULL UNIQUE,
  department   VARCHAR(80) NOT NULL,
  designation  VARCHAR(80),
  specialization VARCHAR(120)
);

-- ---------------------------------------------------------------------
-- PARENT DETAILS
-- ---------------------------------------------------------------------
CREATE TABLE parent_details (
  parent_id    SERIAL PRIMARY KEY,
  student_id   INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  parent_name  VARCHAR(120) NOT NULL,
  relation     VARCHAR(20) DEFAULT 'father' CHECK (relation IN ('father','mother','guardian')),
  email        VARCHAR(120),
  phone        VARCHAR(20)
);

-- ---------------------------------------------------------------------
-- LABS
-- ---------------------------------------------------------------------
CREATE TABLE labs (
  lab_id       SERIAL PRIMARY KEY,
  lab_name     VARCHAR(120) NOT NULL,
  lab_code     VARCHAR(30) UNIQUE,
  location     VARCHAR(120),
  capacity     INT DEFAULT 30,
  status       VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance')),
  in_charge    INT REFERENCES faculty(faculty_id) ON DELETE SET NULL,
  description  TEXT
);

-- ---------------------------------------------------------------------
-- EQUIPMENT
-- ---------------------------------------------------------------------
CREATE TABLE equipment (
  equipment_id SERIAL PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  serial_no    VARCHAR(60) UNIQUE,
  category     VARCHAR(80),
  lab_id       INT REFERENCES labs(lab_id) ON DELETE SET NULL,
  status       VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','reserved','in_use','maintenance','lost')),
  purchase_date DATE,
  cost         NUMERIC(10,2),
  notes        TEXT
);

-- ---------------------------------------------------------------------
-- EQUIPMENT REQUESTS / ISSUES
-- ---------------------------------------------------------------------
CREATE TABLE equipment_requests (
  request_id   SERIAL PRIMARY KEY,
  equipment_id INT NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  student_id   INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  faculty_id   INT REFERENCES faculty(faculty_id) ON DELETE SET NULL,
  issue_date   TIMESTAMPTZ,
  return_date  TIMESTAMPTZ,
  expected_return TIMESTAMPTZ,
  status       VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','issued','returned','overdue')),
  remarks      TEXT
);

-- ---------------------------------------------------------------------
-- TIMETABLE
-- ---------------------------------------------------------------------
CREATE TABLE timetable (
  timetable_id SERIAL PRIMARY KEY,
  lab_id       INT NOT NULL REFERENCES labs(lab_id) ON DELETE CASCADE,
  faculty_id   INT NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
  subject      VARCHAR(120) NOT NULL,
  day_of_week  VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Mon','Tue','Wed','Thu','Fri','Sat')),
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  semester     INT,
  section      VARCHAR(5),
  department   VARCHAR(80)
);

-- ---------------------------------------------------------------------
-- LAB BOOKINGS
-- ---------------------------------------------------------------------
CREATE TABLE bookings (
  booking_id   SERIAL PRIMARY KEY,
  lab_id       INT NOT NULL REFERENCES labs(lab_id) ON DELETE CASCADE,
  requested_by INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  purpose      VARCHAR(255),
  booking_date DATE NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  status       VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  approved_by  INT REFERENCES users(user_id) ON DELETE SET NULL,
  remarks      TEXT,
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- ATTENDANCE
-- ---------------------------------------------------------------------
CREATE TABLE attendance (
  attendance_id SERIAL PRIMARY KEY,
  student_id    INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  lab_id        INT NOT NULL REFERENCES labs(lab_id) ON DELETE CASCADE,
  faculty_id    INT REFERENCES faculty(faculty_id) ON DELETE SET NULL,
  attend_date   DATE NOT NULL,
  status        VARCHAR(20) DEFAULT 'absent' CHECK (status IN ('present','absent','late')),
  method        VARCHAR(20) DEFAULT 'manual' CHECK (method IN ('manual','qr','camera')),
  marked_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uniq_attend UNIQUE (student_id, lab_id, attend_date)
);

CREATE TABLE face_attendance (
  face_id      SERIAL PRIMARY KEY,
  student_id   INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  confidence   NUMERIC(5,2),
  image_path   VARCHAR(255),
  detected_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- COMPLAINTS
-- ---------------------------------------------------------------------
CREATE TABLE complaints (
  complaint_id SERIAL PRIMARY KEY,
  raised_by    INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  lab_id       INT REFERENCES labs(lab_id) ON DELETE SET NULL,
  equipment_id INT REFERENCES equipment(equipment_id) ON DELETE SET NULL,
  title        VARCHAR(150) NOT NULL,
  description  TEXT,
  status       VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','resolved')),
  priority     VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  resolved_by  INT REFERENCES users(user_id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at  TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- ANNOUNCEMENTS
-- ---------------------------------------------------------------------
CREATE TABLE announcements (
  announcement_id SERIAL PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  content      TEXT NOT NULL,
  category     VARCHAR(30) DEFAULT 'general',
  posted_by    INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  target_role  VARCHAR(20) DEFAULT 'all' CHECK (target_role IN ('all','student','faculty','hod')),
  is_pinned    BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcement_reads (
  id SERIAL PRIMARY KEY,
  announcement_id INT NOT NULL REFERENCES announcements(announcement_id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uniq_announcement_user UNIQUE (announcement_id, user_id)
);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  notif_id     SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  type         VARCHAR(60),
  title        VARCHAR(200),
  message      TEXT,
  is_read      BOOLEAN DEFAULT FALSE,
  meta         JSONB,
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- AUDIT LOGS
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
  log_id      SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(user_id) ON DELETE SET NULL,
  action      VARCHAR(120) NOT NULL,
  entity      VARCHAR(80),
  entity_id   INT,
  details     TEXT,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- EXPERIMENTS / MANUALS
-- ---------------------------------------------------------------------
CREATE TABLE experiments (
  exp_id      SERIAL PRIMARY KEY,
  lab_id      INT NOT NULL REFERENCES labs(lab_id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  manual_file VARCHAR(255),
  uploaded_by INT REFERENCES users(user_id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- CHATBOT LOGS
-- ---------------------------------------------------------------------
CREATE TABLE chatbot_logs (
  chat_id     SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(user_id) ON DELETE SET NULL,
  user_query  TEXT,
  bot_reply   TEXT,
  intent      VARCHAR(80),
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- OTP TABLES
-- ---------------------------------------------------------------------
CREATE TABLE login_otps (
  email VARCHAR(191) PRIMARY KEY,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE signup_otps (
  email VARCHAR(191) PRIMARY KEY,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- ---------------------------------------------------------------------
-- TESTS & SUBMISSIONS
-- ---------------------------------------------------------------------
CREATE TABLE tests (
  test_id SERIAL PRIMARY KEY,
  subject VARCHAR(120) NOT NULL,
  created_by INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  duration_minutes INT DEFAULT 10,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','closed')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE test_questions (
  question_id SERIAL PRIMARY KEY,
  test_id INT NOT NULL REFERENCES tests(test_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option VARCHAR(1) NOT NULL CHECK (correct_option IN ('a','b','c','d'))
);

CREATE TABLE test_submissions (
  submission_id SERIAL PRIMARY KEY,
  test_id INT NOT NULL REFERENCES tests(test_id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  answers_json JSONB NOT NULL,
  score INT,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================================

CREATE OR REPLACE FUNCTION fn_attendance_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs(user_id, action, entity, entity_id, details)
  VALUES (NEW.faculty_id, 'ATTENDANCE_MARKED', 'attendance', NEW.attendance_id,
    'Student ' || NEW.student_id || ' marked ' || NEW.status || ' via ' || NEW.method);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_attendance_audit
AFTER INSERT ON attendance
FOR EACH ROW EXECUTE FUNCTION fn_attendance_audit();

CREATE OR REPLACE FUNCTION fn_booking_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') THEN
    INSERT INTO notifications(user_id, type, title, message)
    VALUES (NEW.requested_by, 'booking', 'Booking Approved',
      'Your booking #' || NEW.booking_id || ' has been approved.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_approved
AFTER UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION fn_booking_approved();

CREATE OR REPLACE FUNCTION fn_complaint_resolved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND (OLD.status IS NULL OR OLD.status <> 'resolved') THEN
    INSERT INTO notifications(user_id, type, title, message)
    VALUES (NEW.raised_by, 'complaint', 'Complaint Resolved',
      'Your complaint "' || NEW.title || '" has been resolved.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_complaint_resolved
AFTER UPDATE ON complaints
FOR EACH ROW EXECUTE FUNCTION fn_complaint_resolved();

-- =====================================================================
-- STORED PROCEDURES (POSTGRESQL FUNCTIONS)
-- =====================================================================

CREATE OR REPLACE FUNCTION sp_attendance_percentage(p_student_id INT)
RETURNS TABLE (
  student_id INT,
  full_name VARCHAR,
  total_classes BIGINT,
  attended BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.student_id,
    u.full_name,
    COUNT(*) AS total_classes,
    COUNT(*) FILTER (WHERE a.status = 'present') AS attended,
    ROUND(COUNT(*) FILTER (WHERE a.status = 'present') * 100.0 / NULLIF(COUNT(*), 0), 2) AS percentage
  FROM attendance a
  JOIN students s ON s.student_id = a.student_id
  JOIN users u    ON u.user_id    = s.user_id
  WHERE a.student_id = p_student_id
  GROUP BY s.student_id, u.full_name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_lab_utilization()
RETURNS TABLE (
  lab_id INT,
  lab_name VARCHAR,
  total_bookings BIGINT,
  approved_bookings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT l.lab_id, l.lab_name,
    COUNT(b.booking_id) AS total_bookings,
    COUNT(b.booking_id) FILTER (WHERE b.status = 'approved') AS approved_bookings
  FROM labs l
  LEFT JOIN bookings b ON b.lab_id = l.lab_id
  GROUP BY l.lab_id, l.lab_name
  ORDER BY total_bookings DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- VIEWS
-- =====================================================================

CREATE OR REPLACE VIEW v_student_attendance_pct AS
SELECT s.student_id, u.full_name, s.usn,
  COUNT(a.attendance_id) AS total,
  COUNT(a.attendance_id) FILTER (WHERE a.status = 'present') AS present_count,
  ROUND(COUNT(a.attendance_id) FILTER (WHERE a.status = 'present') * 100.0 / NULLIF(COUNT(a.attendance_id), 0), 2) AS percentage
FROM students s
JOIN users u ON u.user_id = s.user_id
LEFT JOIN attendance a ON a.student_id = s.student_id
GROUP BY s.student_id, u.full_name, s.usn;

CREATE OR REPLACE VIEW v_lab_heatmap AS
SELECT lab_id, EXTRACT(HOUR FROM start_time)::INT AS hour_block, COUNT(*) AS occupancy
FROM bookings WHERE status = 'approved'
GROUP BY lab_id, EXTRACT(HOUR FROM start_time);

-- =====================================================================
-- SEED DATA
-- =====================================================================

INSERT INTO users(full_name, email, password_hash, role, phone) VALUES
('Dr. Anitha Rao',  'hod@lab.edu',     '$2a$10$Fh1xGYrJiG.iivBEmieIye1RrzjX7ItFhwEBLXsSwzRsHiEYC7UU2', 'hod',     '9000000001'),
('Prof. R. Sharma', 'faculty@lab.edu', '$2a$10$Fh1xGYrJiG.iivBEmieIye1RrzjX7ItFhwEBLXsSwzRsHiEYC7UU2', 'faculty', '9000000002'),
('Chinmay Hegde',   'student@lab.edu', '$2a$10$Fh1xGYrJiG.iivBEmieIye1RrzjX7ItFhwEBLXsSwzRsHiEYC7UU2', 'student', '9000000003');

INSERT INTO faculty(user_id, emp_code, department, designation) VALUES
(2, 'FAC001', 'Computer Science', 'Assistant Professor');

INSERT INTO students(user_id, usn, department, semester, section, batch_year) VALUES
(3, '4PM22CS001', 'Computer Science', 5, 'A', 2022);

INSERT INTO parent_details(student_id, parent_name, relation, email, phone) VALUES
(1, 'Mr. Hegde', 'father', 'parent@example.com', '9000000099');

INSERT INTO labs(lab_name, lab_code, location, capacity, status, in_charge) VALUES
('ADA',             'CL01', 'Block A - 201', 40, 'available', 1),
('DBMS',            'CL02', 'Block A - 202', 40, 'available', 1),
('LATEX',           'CL03', 'Block A - 203', 40, 'available', 1),
('MICROCONTROLLER', 'IOT01','Block B - 105', 25, 'available', 1),
('MONGODB',         'CL04', 'Block B - 106', 40, 'available', 1),
('AI',              'CL05', 'Block B - 107', 40, 'available', 1),
('JAVA',            'CL06', 'Block B - 108', 40, 'available', 1),
('C LANGUAGE',      'CL07', 'Block B - 109', 40, 'available', 1),
('DSA',             'CL08', 'Block B - 110', 40, 'available', 1);

INSERT INTO equipment(name, serial_no, category, lab_id, status, cost) VALUES
('Dell OptiPlex 7090', 'PC-001', 'Desktop', 1, 'available', 55000),
('Arduino Uno R3',     'ARD-014','Microcontroller', 4, 'available', 1200),
('Oscilloscope',       'OSC-002','Instrument', 4, 'in_use', 32000);

INSERT INTO announcements(title, content, category, posted_by, target_role, is_pinned) VALUES
('Welcome to Smart Lab Portal', 'New semester begins on Monday. All students must mark attendance via the new camera system.', 'general', 1, 'all', TRUE),
('Lab 3 Maintenance', 'IoT Lab will be closed for upgrades this week.', 'maintenance', 1, 'all', FALSE);

INSERT INTO timetable(lab_id, faculty_id, subject, day_of_week, start_time, end_time, semester, section, department) VALUES
(1, 1, 'Data Structures Lab', 'Mon', '09:00:00', '11:00:00', 5, 'A', 'Computer Science'),
(2, 1, 'DBMS Lab',            'Wed', '14:00:00', '16:00:00', 5, 'A', 'Computer Science');

INSERT INTO attendance(student_id, lab_id, faculty_id, attend_date, status, method) VALUES
(1, 1, 1, CURRENT_DATE - INTERVAL '7 days', 'present', 'manual'),
(1, 1, 1, CURRENT_DATE - INTERVAL '5 days', 'present', 'qr'),
(1, 2, 1, CURRENT_DATE - INTERVAL '3 days', 'absent',  'manual'),
(1, 1, 1, CURRENT_DATE - INTERVAL '1 day',  'present', 'camera');
