const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    // Simpan payload token ke req.user
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  // Cek role dari token
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

module.exports = { auth, adminOnly };