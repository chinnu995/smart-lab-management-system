const db = require('../config/db');
exports.list = async (req, res) => {
  const [rows] = await db.execute(
    'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100', [req.user.id]
  );
  res.json(rows);
};
exports.markRead = async (req, res) => {
  await db.execute('UPDATE notifications SET is_read=true WHERE notif_id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ message: 'Read' });
};
exports.markAllRead = async (req, res) => {
  await db.execute('UPDATE notifications SET is_read=true WHERE user_id=?', [req.user.id]);
  res.json({ message: 'All read' });
};

exports.clearAll = async (req, res) => {
  await db.execute('DELETE FROM notifications WHERE user_id=?', [req.user.id]);
  res.json({ message: 'All notifications cleared' });
};
