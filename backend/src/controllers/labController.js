const db = require('../config/db');
const audit = require('../utils/audit');

exports.list = async (_req, res) => {
  const [rows] = await db.execute(
    `SELECT l.*, u.full_name AS in_charge_name FROM labs l
       LEFT JOIN faculty f ON f.faculty_id=l.in_charge
       LEFT JOIN users u   ON u.user_id=f.user_id ORDER BY l.lab_id`
  );
  res.json(rows);
};

exports.create = async (req, res) => {
  const { lab_name, lab_code, location, capacity, status, in_charge, description } = req.body;
  const [r] = await db.execute(
    'INSERT INTO labs (lab_name,lab_code,location,capacity,status,in_charge,description) VALUES (?,?,?,?,?,?,?)',
    [lab_name, lab_code, location, capacity || 30, status || 'available', in_charge || null, description || null]
  );
  audit.log(req.user.id, 'CREATE_LAB', 'labs', r.insertId, lab_name, req.ip);
  res.status(201).json({ lab_id: r.insertId });
};

exports.update = async (req, res) => {
  const fields = ['lab_name','lab_code','location','capacity','status','in_charge','description'];
  const sets = [], values = [];
  for (const f of fields) if (req.body[f] !== undefined) { sets.push(`${f}=?`); values.push(req.body[f]); }
  if (!sets.length) return res.json({ message: 'No changes' });
  values.push(req.params.id);
  await db.execute(`UPDATE labs SET ${sets.join(',')} WHERE lab_id=?`, values);
  res.json({ message: 'Updated' });
};

exports.remove = async (req, res) => {
  await db.execute('DELETE FROM labs WHERE lab_id=?', [req.params.id]);
  res.json({ message: 'Deleted' });
};
