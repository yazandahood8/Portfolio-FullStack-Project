// src/controllers/uploadController.js
import userModel from '../models/userModel.js';

export const uploadProfileImage = async (req, res, next) => {
  try {
    const { id } = req.params;              // users/:id/photo
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const user = await userModel.update(id, { profile_image_url: url });
    res.json({ success: true, data: user, message: 'Profile image updated.' });
  } catch (err) {
    next(err);
  }
};
