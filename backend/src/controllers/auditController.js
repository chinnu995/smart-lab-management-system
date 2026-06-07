const db = require('../config/db');
exports.list = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '100'), 500);
  const [rows] = await db.query(
    `SELECT a.*, u.full_name FROM audit_logs a
       LEFT JOIN users u ON u.user_id=a.user_id
      ORDER BY a.created_at DESC LIMIT ?`, [limit]
  );
  res.json(rows);
};
