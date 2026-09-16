const db = require('../config/db');
const audit = require('../utils/audit');

exports.list = async (req, res) => {
  let sql = `SELECT b.*, l.lab_name, u.full_name AS requester
               FROM bookings b
               JOIN labs l ON l.lab_id=b.lab_id
               JOIN users u ON u.user_id=b.requested_by`;
  const params = [];
  if (req.user.role === 'student') { sql += ' WHERE b.requested_by=?'; params.push(req.user.id); }
  sql += ' ORDER BY b.booking_date DESC, b.start_time DESC';
  const [rows] = await db.execute(sql, params);
  res.json(rows);
};

exports.create = async (req, res) => {
  const { lab_id, purpose, booking_date, start_time, end_time } = req.body;
  const [r] = await db.execute(
    `INSERT INTO bookings (lab_id, requested_by, purpose, booking_date, start_time, end_time)
     VALUES (?,?,?,?,?,?)`,
    [lab_id, req.user.id, purpose || null, booking_date, start_time, end_time]
  );
  audit.log(req.user.id, 'CREATE_BOOKING', 'bookings', r.insertId, `Lab ${lab_id} on ${booking_date}`, req.ip);

  // Notify HOD + faculty
  const io = req.app.get('io');
  io.to('role:hod').to('role:faculty').emit('booking:new', { booking_id: r.insertId, lab_id, booking_date });

  res.status(201).json({ booking_id: r.insertId });
};

exports.decide = async (req, res) => {
  const { status, remarks } = req.body;  // approved | rejected
  if (!['approved','rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  await db.execute(
    'UPDATE bookings SET status=?, approved_by=?, remarks=? WHERE booking_id=?',
    [status, req.user.id, remarks || null, req.params.id]
  );
  const [rows] = await db.execute('SELECT requested_by, lab_id FROM bookings WHERE booking_id=?', [req.params.id]);
  const io = req.app.get('io');
  if (rows.length) {
    const { requested_by, lab_id } = rows[0];
    io.to(`user:${requested_by}`).emit('notification', {
      type: 'booking', title: `Booking ${status}`, message: `Your booking #${req.params.id} was ${status}.`
    });
    if (status === 'approved') {
      await db.execute('UPDATE labs SET status="occupied" WHERE lab_id=?', [lab_id]);
      io.to('role:hod').to('role:faculty').emit('lab:status_changed', { lab_id, status: 'occupied' });
    }
  }
  io.to('role:hod').to('role:faculty').emit('booking:changed', { booking_id: req.params.id, status });
  audit.log(req.user.id, `BOOKING_${status.toUpperCase()}`, 'bookings', req.params.id, remarks || '', req.ip);
  res.json({ message: 'Updated' });
};

exports.cancel = async (req, res) => {
  await db.execute('UPDATE bookings SET status="cancelled" WHERE booking_id=? AND requested_by=?',
    [req.params.id, req.user.id]);
  res.json({ message: 'Cancelled' });
};
