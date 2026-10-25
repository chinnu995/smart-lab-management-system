const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.requireRole = (...roles) => (req, res, next) => {
  const allowed = [...roles];
  // HOD also has full faculty privileges and can access all faculty endpoints
  if (allowed.includes('faculty') && !allowed.includes('hod')) {
    allowed.push('hod');
  }
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  next();
};
