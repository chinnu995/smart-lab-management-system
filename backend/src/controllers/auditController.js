const db = require('../config/db');

exports.list = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '200'), 500);
    const filterAction = req.query.action;
    
    let query = `
      SELECT a.*, u.full_name, u.role, s.usn, s.department, s.section
      FROM audit_logs a
      LEFT JOIN users u ON u.user_id = a.user_id
      LEFT JOIN students s ON s.user_id = a.user_id
    `;
    const params = [];

    if (filterAction) {
      query += ` WHERE a.action = ?`;
      params.push(filterAction);
    }

    query += ` ORDER BY a.created_at DESC LIMIT ${limit}`;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
