const db = require('../config/db');

exports.overview = async (_req, res) => {
  const [[s]] = await db.query('SELECT COUNT(*) AS c FROM students');
  const [[f]] = await db.query('SELECT COUNT(*) AS c FROM faculty');
  const [[l]] = await db.query('SELECT COUNT(*) AS c FROM labs');
  const [[e]] = await db.query('SELECT COUNT(*) AS c FROM equipment');
  const [[b]] = await db.query("SELECT COUNT(*) AS c FROM bookings WHERE status='approved'");
  const [[c]] = await db.query("SELECT COUNT(*) AS c FROM complaints WHERE status!='resolved'");
  const [[a]] = await db.query('SELECT COUNT(*) AS c FROM announcements');
  res.json({
    students: Number(s?.c || 0),
    faculty: Number(f?.c || 0),
    labs: Number(l?.c || 0),
    equipment: Number(e?.c || 0),
    activeBookings: Number(b?.c || 0),
    openComplaints: Number(c?.c || 0),
    announcements: Number(a?.c || 0),
  });
};

exports.attendanceTrend = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT attend_date AS date,
            SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) AS present,
            SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END)  AS absent,
            SUM(CASE WHEN status='late' THEN 1 ELSE 0 END)    AS late
       FROM attendance
       WHERE attend_date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY attend_date ORDER BY attend_date`
  );
  res.json((rows || []).map(r => ({
    date: r.date,
    present: Number(r.present || 0),
    absent: Number(r.absent || 0),
    late: Number(r.late || 0)
  })));
};

exports.labUtilization = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT l.lab_name,
            COUNT(b.booking_id) AS total,
            SUM(CASE WHEN b.status='approved' THEN 1 ELSE 0 END) AS approved
       FROM labs l LEFT JOIN bookings b ON b.lab_id=l.lab_id
       GROUP BY l.lab_id, l.lab_name ORDER BY total DESC`
  );
  res.json((rows || []).map(r => ({
    lab_name: r.lab_name,
    total: Number(r.total || 0),
    approved: Number(r.approved || 0)
  })));
};

exports.equipmentStatus = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT status, COUNT(*) AS count FROM equipment GROUP BY status`
  );
  res.json((rows || []).map(r => ({
    status: r.status,
    count: Number(r.count || 0)
  })));
};

exports.complaintResolution = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT status, COUNT(*) AS count FROM complaints GROUP BY status`
  );
  res.json((rows || []).map(r => ({
    status: r.status,
    count: Number(r.count || 0)
  })));
};

// Heatmap: lab x hour-of-day
exports.heatmap = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT l.lab_name, HOUR(b.start_time) AS hour, COUNT(b.booking_id) AS bookings
       FROM labs l
       LEFT JOIN bookings b ON b.lab_id=l.lab_id AND b.status='approved'
       GROUP BY l.lab_id, l.lab_name, HOUR(b.start_time)
       ORDER BY l.lab_name, hour`
  );
  res.json((rows || []).map(r => ({
    lab_name: r.lab_name,
    hour: Number(r.hour || 0),
    bookings: Number(r.bookings || 0)
  })));
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
  res.json((rows || []).map(r => ({
    full_name: r.full_name,
    classes_marked: Number(r.classes_marked || 0),
    complaints_resolved: Number(r.complaints_resolved || 0)
  })));
};
