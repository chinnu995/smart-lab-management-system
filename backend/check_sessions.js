require('dotenv').config();
const db = require('./src/config/db');
(async () => {
  const [sessions] = await db.execute(
    `SELECT ls.session_id, ls.subject, ls.lab_id, ls.class_name, ls.status, ls.qr_expires_at, l.lab_name
     FROM lab_sessions ls JOIN labs l ON l.lab_id = ls.lab_id
     ORDER BY ls.created_at DESC LIMIT 10`
  );
  console.log('Recent sessions:', JSON.stringify(sessions, null, 2));
  
  const [active] = await db.execute(
    `SELECT ls.session_id, ls.subject, ls.lab_id, ls.class_name, ls.status, ls.qr_expires_at, l.lab_name
     FROM lab_sessions ls JOIN labs l ON l.lab_id = ls.lab_id
     WHERE ls.status = 'active' AND (ls.qr_expires_at IS NULL OR ls.qr_expires_at > CURRENT_TIMESTAMP)`
  );
  console.log('Active sessions:', JSON.stringify(active, null, 2));
  process.exit(0);
})();
