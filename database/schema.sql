-- =====================================================================
-- SMART LAB MANAGEMENT SYSTEM - MySQL Schema
-- Author: Chinmay Hegde and Team
-- =====================================================================
DROP DATABASE IF EXISTS smart_lab_db;
CREATE DATABASE smart_lab_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_lab_db;

-- ---------------------------------------------------------------------
-- USERS (base table for auth)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  user_id        INT AUTO_INCREMENT PRIMARY KEY,
  full_name      VARCHAR(120) NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           ENUM('student','faculty','hod') NOT NULL,
  phone          VARCHAR(20),
  profile_image  VARCHAR(255),
  is_active      BOOLEAN DEFAULT TRUE,
  reset_token    VARCHAR(255),
  reset_expires  DATETIME,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- STUDENTS
-- ---------------------------------------------------------------------
CREATE TABLE students (
  student_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL UNIQUE,
  usn            VARCHAR(30) NOT NULL UNIQUE,
  department     VARCHAR(80) NOT NULL,
  semester       INT NOT NULL,
  section        VARCHAR(5),
  batch_year     INT,
  face_encoding  TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- FACULTY
-- ---------------------------------------------------------------------
CREATE TABLE faculty (
  faculty_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL UNIQUE,
  emp_code     VARCHAR(30) NOT NULL UNIQUE,
  department   VARCHAR(80) NOT NULL,
  designation  VARCHAR(80),
  specialization VARCHAR(120),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PARENT DETAILS
-- ---------------------------------------------------------------------
CREATE TABLE parent_details (
  parent_id    INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  parent_name  VARCHAR(120) NOT NULL,
  relation     ENUM('father','mother','guardian') DEFAULT 'father',
  email        VARCHAR(120),
  phone        VARCHAR(20),
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- LABS
-- ---------------------------------------------------------------------
CREATE TABLE labs (
  lab_id       INT AUTO_INCREMENT PRIMARY KEY,
  lab_name     VARCHAR(120) NOT NULL,
  lab_code     VARCHAR(30) UNIQUE,
  location     VARCHAR(120),
  capacity     INT DEFAULT 30,
  status       ENUM('available','occupied','maintenance') DEFAULT 'available',
  in_charge    INT,
  description  TEXT,
  FOREIGN KEY (in_charge) REFERENCES faculty(faculty_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- EQUIPMENT
-- ---------------------------------------------------------------------
CREATE TABLE equipment (
  equipment_id INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  serial_no    VARCHAR(60) UNIQUE,
  category     VARCHAR(80),
  lab_id       INT,
  status       ENUM('available','reserved','in_use','maintenance','lost') DEFAULT 'available',
  purchase_date DATE,
  cost         DECIMAL(10,2),
  notes        TEXT,
  FOREIGN KEY (lab_id) REFERENCES labs(lab_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- EQUIPMENT REQUESTS / ISSUES
-- ---------------------------------------------------------------------
CREATE TABLE equipment_requests (
  request_id   INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  student_id   INT NOT NULL,
  faculty_id   INT,
  issue_date   DATETIME,
  return_date  DATETIME,
  expected_return DATETIME,
  status       ENUM('pending','issued','returned','overdue') DEFAULT 'pending',
  remarks      TEXT,
  FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- TIMETABLE
-- ---------------------------------------------------------------------
CREATE TABLE timetable (
  timetable_id INT AUTO_INCREMENT PRIMARY KEY,
  lab_id       INT NOT NULL,
  faculty_id   INT NOT NULL,
  subject      VARCHAR(120) NOT NULL,
  day_of_week  ENUM('Mon','Tue','Wed','Thu','Fri','Sat') NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  semester     INT,
  section      VARCHAR(5),
  department   VARCHAR(80),
  FOREIGN KEY (lab_id) REFERENCES labs(lab_id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- LAB BOOKINGS
-- ---------------------------------------------------------------------
CREATE TABLE bookings (
  booking_id   INT AUTO_INCREMENT PRIMARY KEY,
  lab_id       INT NOT NULL,
  requested_by INT NOT NULL,
  purpose      VARCHAR(255),
  booking_date DATE NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  status       ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
  approved_by  INT,
  remarks      TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lab_id) REFERENCES labs(lab_id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ATTENDANCE
-- ---------------------------------------------------------------------
CREATE TABLE attendance (
  attendance_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id    INT NOT NULL,
  lab_id        INT NOT NULL,
  faculty_id    INT,
  attend_date   DATE NOT NULL,
  status        ENUM('present','absent','late') DEFAULT 'absent',
  method        ENUM('manual','qr','camera') DEFAULT 'manual',
  marked_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (lab_id) REFERENCES labs(lab_id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE SET NULL,
  UNIQUE KEY uniq_attend (student_id, lab_id, attend_date)
) ENGINE=InnoDB;

CREATE TABLE face_attendance (
  face_id      INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  confidence   DECIMAL(5,2),
  image_path   VARCHAR(255),
  detected_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- COMPLAINTS
-- ---------------------------------------------------------------------
CREATE TABLE complaints (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  raised_by    INT NOT NULL,
  lab_id       INT,
  equipment_id INT,
  title        VARCHAR(150) NOT NULL,
  description  TEXT,
  status       ENUM('pending','in_progress','resolved') DEFAULT 'pending',
  priority     ENUM('low','medium','high','critical') DEFAULT 'medium',
  resolved_by  INT,
  resolution_notes TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at  TIMESTAMP NULL,
  FOREIGN KEY (raised_by) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (lab_id) REFERENCES labs(lab_id) ON DELETE SET NULL,
  FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ANNOUNCEMENTS
-- ---------------------------------------------------------------------
CREATE TABLE announcements (
  announcement_id INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  content      TEXT NOT NULL,
  category     ENUM('general','lab_update','exam','attendance_alert','equipment','workshop','emergency','maintenance') DEFAULT 'general',
  posted_by    INT NOT NULL,
  target_role  ENUM('all','student','faculty','hod') DEFAULT 'all',
  is_pinned    BOOLEAN DEFAULT FALSE,
  scheduled_at DATETIME,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE announcement_reads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  announcement_id INT NOT NULL,
  user_id INT NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (announcement_id, user_id),
  FOREIGN KEY (announcement_id) REFERENCES announcements(announcement_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  notif_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  type         VARCHAR(60),
  title        VARCHAR(200),
  message      TEXT,
  is_read      BOOLEAN DEFAULT FALSE,
  meta         JSON,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- AUDIT LOGS
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
  log_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  action      VARCHAR(120) NOT NULL,
  entity      VARCHAR(80),
  entity_id   INT,
  details     TEXT,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- EXPERIMENTS / MANUALS
-- ---------------------------------------------------------------------
CREATE TABLE experiments (
  exp_id      INT AUTO_INCREMENT PRIMARY KEY,
  lab_id      INT NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  manual_file VARCHAR(255),
  uploaded_by INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lab_id) REFERENCES labs(lab_id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- CHATBOT LOGS
-- ---------------------------------------------------------------------
CREATE TABLE chatbot_logs (
  chat_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  user_query  TEXT,
  bot_reply   TEXT,
  intent      VARCHAR(80),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- TRIGGERS
-- =====================================================================
DELIMITER //

-- Audit log on attendance insert
CREATE TRIGGER trg_attendance_audit
AFTER INSERT ON attendance
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs(user_id, action, entity, entity_id, details)
  VALUES (NEW.faculty_id, 'ATTENDANCE_MARKED', 'attendance', NEW.attendance_id,
    CONCAT('Student ', NEW.student_id, ' marked ', NEW.status, ' via ', NEW.method));
END//

-- Auto-update lab status when booking approved
CREATE TRIGGER trg_booking_approved
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    INSERT INTO notifications(user_id, type, title, message)
    VALUES (NEW.requested_by, 'booking', 'Booking Approved',
      CONCAT('Your booking #', NEW.booking_id, ' has been approved.'));
  END IF;
END//

-- Notify on complaint resolved
CREATE TRIGGER trg_complaint_resolved
AFTER UPDATE ON complaints
FOR EACH ROW
BEGIN
  IF NEW.status = 'resolved' AND OLD.status <> 'resolved' THEN
    INSERT INTO notifications(user_id, type, title, message)
    VALUES (NEW.raised_by, 'complaint', 'Complaint Resolved',
      CONCAT('Your complaint "', NEW.title, '" has been resolved.'));
  END IF;
END//

DELIMITER ;

-- =====================================================================
-- STORED PROCEDURES
-- =====================================================================
DELIMITER //

-- Attendance percentage per student
CREATE PROCEDURE sp_attendance_percentage(IN p_student_id INT)
BEGIN
  SELECT
    s.student_id,
    u.full_name,
    COUNT(*) AS total_classes,
    SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) AS attended,
    ROUND(SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END)*100/COUNT(*), 2) AS percentage
  FROM attendance a
  JOIN students s ON s.student_id = a.student_id
  JOIN users u    ON u.user_id    = s.user_id
  WHERE a.student_id = p_student_id
  GROUP BY s.student_id, u.full_name;
END//

-- Lab utilization report
CREATE PROCEDURE sp_lab_utilization()
BEGIN
  SELECT l.lab_id, l.lab_name,
    COUNT(b.booking_id) AS total_bookings,
    SUM(CASE WHEN b.status='approved' THEN 1 ELSE 0 END) AS approved_bookings
  FROM labs l
  LEFT JOIN bookings b ON b.lab_id = l.lab_id
  GROUP BY l.lab_id, l.lab_name
  ORDER BY total_bookings DESC;
END//

DELIMITER ;

-- =====================================================================
-- SEED DATA
-- =====================================================================
-- Default password for all demo users: "password123"
-- Bcrypt hash generated with cost 10
INSERT INTO users(full_name, email, password_hash, role, phone) VALUES
('Dr. Anitha Rao',  'hod@lab.edu',     '$2a$10$Fh1xGYrJiG.iivBEmieIye1RrzjX7ItFhwEBLXsSwzRsHiEYC7UU2', 'hod',     '9000000001'),
('Prof. R. Sharma', 'faculty@lab.edu', '$2a$10$Fh1xGYrJiG.iivBEmieIye1RrzjX7ItFhwEBLXsSwzRsHiEYC7UU2', 'faculty', '9000000002'),
('Chinmay Hegde',   'student@lab.edu', '$2a$10$Fh1xGYrJiG.iivBEmieIye1RrzjX7ItFhwEBLXsSwzRsHiEYC7UU2', 'student', '9000000003');

INSERT INTO faculty(user_id, emp_code, department, designation) VALUES
(2, 'FAC001', 'Computer Science', 'Assistant Professor');

INSERT INTO students(user_id, usn, department, semester, section, batch_year) VALUES
(3, '1AB22CS001', 'Computer Science', 5, 'A', 2022);

INSERT INTO parent_details(student_id, parent_name, relation, email, phone) VALUES
(1, 'Mr. Hegde', 'father', 'parent@example.com', '9000000099');

INSERT INTO labs(lab_name, lab_code, location, capacity, status, in_charge) VALUES
('ADA',             'CL01', 'Block A - 201', 40, 'available', 1),
('DBMS',            'CL02', 'Block A - 202', 40, 'available', 1),
('LATEX',           'CL03', 'Block A - 203', 40, 'available', 1),
('MICROCONTROLLER', 'IOT01','Block B - 105', 25, 'available', 1),
('MONGODB',         'CL04', 'Block B - 106', 40, 'available', 1),
('AI',              'CL05', 'Block B - 107', 40, 'available', 1),
('JAVA',            'CL06', 'Block B - 108', 40, 'available', 1);

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
(1, 1, 1, CURDATE() - INTERVAL 7 DAY, 'present', 'manual'),
(1, 1, 1, CURDATE() - INTERVAL 5 DAY, 'present', 'qr'),
(1, 2, 1, CURDATE() - INTERVAL 3 DAY, 'absent',  'manual'),
(1, 1, 1, CURDATE() - INTERVAL 1 DAY, 'present', 'camera');

-- ---------------------------------------------------------------------
-- TESTS
-- ---------------------------------------------------------------------
CREATE TABLE tests (
  test_id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(120) NOT NULL,
  created_by INT NOT NULL,
  duration_minutes INT DEFAULT 10,
  status ENUM('active','closed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE test_questions (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option ENUM('a','b','c','d') NOT NULL,
  FOREIGN KEY (test_id) REFERENCES tests(test_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE test_submissions (
  submission_id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT NOT NULL,
  student_id INT NOT NULL,
  answers_json JSON NOT NULL,
  score INT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id) REFERENCES tests(test_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- =====================================================================
-- USEFUL VIEWS
-- =====================================================================
CREATE OR REPLACE VIEW v_student_attendance_pct AS
SELECT s.student_id, u.full_name, s.usn,
  COUNT(a.attendance_id) AS total,
  SUM(a.status='present') AS present_count,
  ROUND(SUM(a.status='present')*100/NULLIF(COUNT(a.attendance_id),0),2) AS percentage
FROM students s
JOIN users u ON u.user_id = s.user_id
LEFT JOIN attendance a ON a.student_id = s.student_id
GROUP BY s.student_id, u.full_name, s.usn;

CREATE OR REPLACE VIEW v_lab_heatmap AS
SELECT lab_id, HOUR(start_time) AS hour_block, COUNT(*) AS occupancy
FROM bookings WHERE status='approved'
GROUP BY lab_id, HOUR(start_time);
