const db = require('../config/db');
const audit = require('../utils/audit');

// Automatically refresh announcements: purges announcements older than 12 hours
async function refresh12HourAnnouncements() {
  try {
    const [res] = await db.query(
      "DELETE FROM announcements WHERE created_at < NOW() - INTERVAL '12 hours'"
    );
    if (res?.rowCount > 0) {
      console.log(`[Announcements] 12-Hour Refresh: Purged ${res.rowCount} expired announcements.`);
    }
  } catch (err) {
    console.error('[Announcements] 12h refresh error:', err.message);
  }
}

// Run 12-hour refresh immediately on startup and schedule recurring 12-hour cycle
refresh12HourAnnouncements();
setInterval(refresh12HourAnnouncements, 12 * 60 * 60 * 1000);

exports.list = async (req, res) => {
  // Purge any announcements older than 12 hours
  await refresh12HourAnnouncements();

  let query = `
    SELECT a.*, u.full_name AS posted_by_name, u.role AS posted_by_role
    FROM announcements a JOIN users u ON u.user_id = a.posted_by
    WHERE a.target_role IN ('all', ?)
      AND a.created_at >= NOW() - INTERVAL '12 hours'
  `;
  const params = [req.user.role];

  // If student, filter announcements specifically for their semester
  if (req.user.role === 'student') {
    const [stuRows] = await db.query(
      `SELECT COALESCE(s.semester, u.semester) AS semester
       FROM users u
       LEFT JOIN students s ON s.user_id = u.user_id
       WHERE u.user_id = ?`,
      [req.user.id]
    ).catch(() => [[]]);
    const studentSem = stuRows?.[0]?.semester;
    if (studentSem) {
      query += ` AND (a.target_semester IS NULL OR a.target_semester = ?)`;
      params.push(studentSem);
    } else {
      query += ` AND a.target_semester IS NULL`;
    }
  }

  query += ` ORDER BY a.is_pinned DESC, a.created_at DESC`;

  const [rows] = await db.execute(query, params);
  res.json(rows);
};

exports.create = async (req, res) => {
  const { title, content, category, target_role, is_pinned, scheduled_at, target_semester, scheme } = req.body;
  const targetSem = target_semester ? parseInt(target_semester, 10) : null;
  const [r] = await db.execute(
    `INSERT INTO announcements (title, content, category, posted_by, target_role, is_pinned, scheduled_at, target_semester, scheme)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [title, content, category || 'general', req.user.id, target_role || 'all', !!is_pinned, scheduled_at || null, targetSem, scheme || null]
  );
  audit.log(req.user.id, 'CREATE_ANNOUNCEMENT', 'announcements', r.insertId, title, req.ip);
  const io = req.app.get('io');
  const payload = { id: r.insertId, title, category: category || 'general', target_semester: targetSem, scheme };
  if (targetSem) {
    io.to(`sem:${targetSem}`).emit('announcement:new', payload);
  } else if (target_role && target_role !== 'all') {
    io.to(`role:${target_role}`).emit('announcement:new', payload);
  } else {
    io.emit('announcement:new', payload);
  }
  res.status(201).json({ announcement_id: r.insertId });
};

exports.update = async (req, res) => {
  const fields = ['title','content','category','target_role','is_pinned','scheduled_at','target_semester','scheme'];
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
    'INSERT INTO announcement_reads (announcement_id, user_id) VALUES (?,?) ON CONFLICT DO NOTHING',
    [req.params.id, req.user.id]
  );
  res.json({ message: 'Marked as read' });
};

exports.refresh12HourAnnouncements = refresh12HourAnnouncements;
