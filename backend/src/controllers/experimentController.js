const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'manuals');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow PPT, PDF, Images, Word docs, text files
    const allowedTypes = [
      '.pdf', '.ppt', '.pptx',
      '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp',
      '.docx', '.doc', '.txt'
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PPT, PPTX, PDF, Image (PNG, JPG, WEBP), DOCX, and TXT files are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
}).single('manual');

exports.uploadMiddleware = upload;

exports.create = async (req, res) => {
  const { lab_id, title, description } = req.body;
  if (!lab_id || !title) {
    return res.status(400).json({ message: 'lab_id and title are required' });
  }

  const manual_file = req.file ? `/uploads/manuals/${req.file.filename}` : null;

  try {
    const [r] = await db.execute(
      'INSERT INTO experiments (lab_id, title, description, manual_file, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [lab_id, title, description || null, manual_file, req.user.id]
    );
    res.status(201).json({ exp_id: r.insertId, lab_id, title, description, manual_file });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.list = async (req, res) => {
  const { lab_id } = req.query;
  try {
    let sql = `SELECT e.*, u.full_name AS uploader_name, l.lab_name FROM experiments e
               LEFT JOIN users u ON u.user_id = e.uploaded_by
               LEFT JOIN labs l ON l.lab_id = e.lab_id`;
    const params = [];
    if (lab_id) {
      sql += ' WHERE e.lab_id = ?';
      params.push(lab_id);
    }
    sql += ' ORDER BY e.exp_id DESC';
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT manual_file FROM experiments WHERE exp_id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Experiment not found' });
    
    // Delete the file if it exists
    const manualFile = rows[0].manual_file;
    if (manualFile) {
      const filePath = path.join(__dirname, '..', '..', manualFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.execute('DELETE FROM experiments WHERE exp_id = ?', [id]);
    res.json({ message: 'Experiment manual deleted successfully' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
