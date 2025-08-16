import userModel from '../models/userModel.js';
import { updateUserSchema } from '../validators/userValidators.js';


export const getUsers = async (req, res, next) => {
  try {
    const filters = { skill: req.query.skill, location: req.query.location };
    const users = await userModel.getAll(filters);
    res.json({ success: true, data: users, message: 'Users retrieved.' });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await userModel.getByIdWithSocialLinks(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user, message: 'User retrieved.' });
  } catch (err) {
    console.error("GET /users/:id error:", err);
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const user = await userModel.update(req.params.id, value);
    res.json({ success: true, data: user, message: 'User updated.' });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    await userModel.delete(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
};
