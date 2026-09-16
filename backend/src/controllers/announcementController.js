const db = require('../config/db');
const audit = require('../utils/audit');

exports.list = async (req, res) => {
  const [rows] = await db.execute(
    `SELECT a.*, u.full_name AS posted_by_name, u.role AS posted_by_role
       FROM announcements a JOIN users u ON u.user_id=a.posted_by
       WHERE a.target_role IN ('all', ?) ORDER BY a.is_pinned DESC, a.created_at DESC`,
    [req.user.role]
  );
  res.json(rows);
};

exports.create = async (req, res) => {
  const { title, content, category, target_role, is_pinned, scheduled_at } = req.body;
  const [r] = await db.execute(
    `INSERT INTO announcements (title, content, category, posted_by, target_role, is_pinned, scheduled_at)
     VALUES (?,?,?,?,?,?,?)`,
    [title, content, category || 'general', req.user.id, target_role || 'all', !!is_pinned, scheduled_at || null]
  );
  audit.log(req.user.id, 'CREATE_ANNOUNCEMENT', 'announcements', r.insertId, title, req.ip);
  const io = req.app.get('io');
  const payload = { id: r.insertId, title, category: category || 'general' };
  if (target_role && target_role !== 'all') io.to(`role:${target_role}`).emit('announcement:new', payload);
  else io.emit('announcement:new', payload);
  res.status(201).json({ announcement_id: r.insertId });
};

exports.update = async (req, res) => {
  const fields = ['title','content','category','target_role','is_pinned','scheduled_at'];
  const sets = [], values = [];
  for (const f of fields) if (req.body[f] !== undefined) { sets.push(`${f}=?`); values.push(req.body[f]); }
  if (!sets.length) return res.json({ message: 'No changes' });
  values.push(req.params.id);
  await db.execute(`UPDATE announcements SET ${sets.join(',')} WHERE announcement_id=?`, values);
  res.json({ message: 'Updated' });
};

exports.remove = async (req, res) => {
  await db.execute('DELETE FROM announcements WHERE announcement_id=?', [req.params.id]);
  res.json({ message: 'Deleted' });
};

exports.markRead = async (req, res) => {
  await db.execute(
    'INSERT IGNORE INTO announcement_reads (announcement_id, user_id) VALUES (?,?)',
    [req.params.id, req.user.id]
  );
  res.json({ message: 'Marked as read' });
};
