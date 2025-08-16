// src/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import { registerSchema, loginSchema } from '../validators/authValidators.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// In-memory store; swap out for a real table if you like
let refreshTokens = [];

// src/controllers/authController.js
export const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    if (await userModel.getByEmail(value.email)) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    // hash the plain-text password
    const hash = await bcrypt.hash(value.password, 10);

    // strip out the raw password and only keep the rest
    const { password, ...userData } = value;

    // now insert only the real columns (no `password` key!)
    const user = await userModel.create({ ...userData, password_hash: hash });

    const accessToken  = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
    refreshTokens.push(refreshToken);

    return res.status(201).json({
      success: true,
      data:  { user, accessToken, refreshToken },
      message: 'Registration successful.'
    });
  } catch (err) {
    next(err);
  }
};


export const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const user = await userModel.getByEmail(value.email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const match = await bcrypt.compare(value.password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
    refreshTokens.push(refreshToken);

    res.json({
      success: true,
      data: { user, accessToken, refreshToken },
      message: 'Login successful.'
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token || !refreshTokens.includes(token)) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }
    const payload = jwt.verify(token, REFRESH_SECRET);
    const newAccess = jwt.sign({ id: payload.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ success: true, data: { accessToken: newAccess }, message: 'Token refreshed.' });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter(t => t !== token);
  res.json({ success: true, message: 'Logged out successfully.' });
};
