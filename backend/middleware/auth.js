const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    const user = await User.findById(payload.id).select('_id name email');
    if (!user) {
      return res.status(401).json({ message: 'User account not found' });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}

module.exports = { requireAuth };
