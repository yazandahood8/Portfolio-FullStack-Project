import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticate = async (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Server misconfigured: JWT_SECRET is missing.' });
    }

    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const token = header.slice(7);
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

    req.user = { id: String(user.id) };
    next();
  } catch (err) { next(err); }
};
