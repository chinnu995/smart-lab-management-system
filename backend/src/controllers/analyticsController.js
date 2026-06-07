const db = require('../config/db');

exports.overview = async (_req, res) => {
  const [[s]] = await db.query('SELECT COUNT(*) c FROM students');
  const [[f]] = await db.query('SELECT COUNT(*) c FROM faculty');
  const [[l]] = await db.query('SELECT COUNT(*) c FROM labs');
  const [[e]] = await db.query('SELECT COUNT(*) c FROM equipment');
  const [[b]] = await db.query("SELECT COUNT(*) c FROM bookings WHERE status='approved'");
  const [[c]] = await db.query("SELECT COUNT(*) c FROM complaints WHERE status!='resolved'");
  const [[a]] = await db.query('SELECT COUNT(*) c FROM announcements');
  res.json({
    students: s.c, faculty: f.c, labs: l.c, equipment: e.c,
    activeBookings: b.c, openComplaints: c.c, announcements: a.c
  });
};

exports.attendanceTrend = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT attend_date AS date,
            SUM(status='present') AS present,
            SUM(status='absent')  AS absent,
            SUM(status='late')    AS late
       FROM attendance
       WHERE attend_date >= CURDATE() - INTERVAL 30 DAY
       GROUP BY attend_date ORDER BY attend_date`
  );
  res.json(rows);
};

exports.labUtilization = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT l.lab_name,
            COUNT(b.booking_id) AS total,
            SUM(b.status='approved') AS approved
       FROM labs l LEFT JOIN bookings b ON b.lab_id=l.lab_id
       GROUP BY l.lab_id, l.lab_name ORDER BY total DESC`
  );
  res.json(rows);
};

exports.equipmentStatus = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT status, COUNT(*) AS count FROM equipment GROUP BY status`
  );
  res.json(rows);
};

exports.complaintResolution = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT status, COUNT(*) AS count FROM complaints GROUP BY status`
  );
  res.json(rows);
};

// Heatmap: lab x hour-of-day
exports.heatmap = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT l.lab_name, HOUR(b.start_time) AS hour, COUNT(*) AS bookings
       FROM bookings b JOIN labs l ON l.lab_id=b.lab_id
       WHERE b.status='approved'
       GROUP BY l.lab_id, l.lab_name, HOUR(b.start_time)
       ORDER BY l.lab_name, hour`
  );
  res.json(rows);
};

exports.facultyPerformance = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT u.full_name,
            COUNT(DISTINCT a.attendance_id) AS classes_marked,
            COUNT(DISTINCT c.complaint_id) AS complaints_resolved
       FROM faculty f
       JOIN users u ON u.user_id=f.user_id
       LEFT JOIN attendance a ON a.faculty_id=f.faculty_id
       LEFT JOIN complaints c ON c.resolved_by=u.user_id AND c.status='resolved'
       GROUP BY f.faculty_id, u.full_name`
  );
  res.json(rows);
};
