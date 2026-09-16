const db = require('../config/db');
const audit = require('../utils/audit');

exports.list = async (req, res) => {
  let sql = `SELECT c.*, u.full_name AS raised_by_name, l.lab_name
               FROM complaints c
               JOIN users u ON u.user_id=c.raised_by
               LEFT JOIN labs l ON l.lab_id=c.lab_id`;
  const params = [];
  if (req.user.role === 'student') { sql += ' WHERE c.raised_by=?'; params.push(req.user.id); }
  sql += ' ORDER BY c.created_at DESC';
  const [rows] = await db.execute(sql, params);
  res.json(rows);
};

exports.create = async (req, res) => {
  const { title, description, lab_id, equipment_id, priority } = req.body;
  const [r] = await db.execute(
    'INSERT INTO complaints (raised_by, lab_id, equipment_id, title, description, priority) VALUES (?,?,?,?,?,?)',
    [req.user.id, lab_id || null, equipment_id || null, title, description || null, priority || 'medium']
  );
  audit.log(req.user.id, 'CREATE_COMPLAINT', 'complaints', r.insertId, title, req.ip);
  const io = req.app.get('io');
  io.to('role:faculty').to('role:hod').emit('complaint:new', { id: r.insertId, title });
  res.status(201).json({ complaint_id: r.insertId });
};

exports.update = async (req, res) => {
  const { status, resolution_notes } = req.body;
  await db.execute(
    `UPDATE complaints SET status=?, resolution_notes=?, resolved_by=?, resolved_at=CASE WHEN ?='resolved' THEN NOW() ELSE resolved_at END
     WHERE complaint_id=?`,
    [status, resolution_notes || null, req.user.id, status, req.params.id]
  );
  const io = req.app.get('io');
  io.to('role:hod').to('role:faculty').emit('complaint:changed', { complaint_id: req.params.id, status });
  res.json({ message: 'Updated' });
};
