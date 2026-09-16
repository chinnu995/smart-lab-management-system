const db = require('../config/db');
exports.log = async (userId, action, entity, entityId, details, ip) => {
  try {
    await db.execute(
      'INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address) VALUES (?,?,?,?,?,?)',
      [userId || null, action, entity || null, entityId || null, details || null, ip || null]
    );
  } catch (e) { console.error('audit log failed', e.message); }
};
