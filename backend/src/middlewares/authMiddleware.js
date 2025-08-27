import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticate = async (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Server misconfigured: JWT_SECRET is missing.' });
    }

    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    const tokenUserId = String(payload.id ?? payload.sub ?? payload.userId ?? '');
    if (!tokenUserId) {
      return res.status(401).json({ success: false, message: 'Malformed token: no user id.' });
    }

    const user = await userModel.getById(tokenUserId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    // keep role if you have it in DB; default to 'user'
    req.user = { id: String(user.id), role: user.role ?? 'user' };
    next();
  } catch (err) {
    next(err);
  }
};

export const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized.' });

  const routeUserId = String(req.params.userId || '');
  if (req.user.role === 'admin' || req.user.id === routeUserId) return next();

  return res.status(403).json({ success: false, message: 'Forbidden.' });
};
