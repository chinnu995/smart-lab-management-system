const db = require('../config/db');
const audit = require('../utils/audit');

exports.list = async (_req, res) => {
  const [rows] = await db.execute(
    `SELECT e.*, l.lab_name FROM equipment e LEFT JOIN labs l ON l.lab_id=e.lab_id ORDER BY e.equipment_id DESC`
  );
  res.json(rows);
};

exports.create = async (req, res) => {
  const { name, serial_no, category, lab_id, status, purchase_date, cost, notes } = req.body;
  const [r] = await db.execute(
    'INSERT INTO equipment (name,serial_no,category,lab_id,status,purchase_date,cost,notes) VALUES (?,?,?,?,?,?,?,?)',
    [name, serial_no || null, category || null, lab_id || null, status || 'available', purchase_date || null, cost || null, notes || null]
  );
  audit.log(req.user.id, 'CREATE_EQUIPMENT', 'equipment', r.insertId, name, req.ip);
  res.status(201).json({ equipment_id: r.insertId });
};

exports.update = async (req, res) => {
  const fields = ['name','serial_no','category','lab_id','status','purchase_date','cost','notes'];
  const sets = [], values = [];
  for (const f of fields) if (req.body[f] !== undefined) { sets.push(`${f}=?`); values.push(req.body[f]); }
  if (!sets.length) return res.json({ message: 'No changes' });
  values.push(req.params.id);
  await db.execute(`UPDATE equipment SET ${sets.join(',')} WHERE equipment_id=?`, values);
  res.json({ message: 'Updated' });
};

exports.remove = async (req, res) => {
  await db.execute('DELETE FROM equipment WHERE equipment_id=?', [req.params.id]);
  res.json({ message: 'Deleted' });
};

// Issue equipment to a student
exports.issue = async (req, res) => {
  const { equipment_id, student_id, expected_return } = req.body;
  const [r] = await db.execute(
    `INSERT INTO equipment_requests (equipment_id,student_id,faculty_id,issue_date,expected_return,status)
     VALUES (?,?,?,NOW(),?, 'issued')`,
    [equipment_id, student_id, req.user.faculty_id || null, expected_return || null]
  );
  await db.execute('UPDATE equipment SET status="in_use" WHERE equipment_id=?', [equipment_id]);
  audit.log(req.user.id, 'ISSUE_EQUIPMENT', 'equipment_requests', r.insertId, `Issued to student ${student_id}`, req.ip);
  res.status(201).json({ request_id: r.insertId });
};

exports.returnItem = async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.execute('SELECT equipment_id FROM equipment_requests WHERE request_id=?', [id]);
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  await db.execute('UPDATE equipment_requests SET return_date=NOW(), status="returned" WHERE request_id=?', [id]);
  await db.execute('UPDATE equipment SET status="available" WHERE equipment_id=?', [rows[0].equipment_id]);
  res.json({ message: 'Returned' });
};
