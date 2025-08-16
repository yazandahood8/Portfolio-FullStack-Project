// backend/src/controllers/educationController.js
import educationModel from '../models/educationModel.js';
import { educationSchema } from '../validators/educationValidators.js';

export const getEducations = async (req, res, next) => {
  try {
    console.log('GET EDUCATIONS: req.params =', req.params); // Should show { userId: ... }
const educations = await educationModel.getAllByUser(req.params.userId);
    res.json({ success: true, data: educations, message: 'Educations retrieved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const createEducation = async (req, res, next) => {
  try {
    console.log('createEducation: req.user.id =', req.user.id, 'req.params.userId =', req.params.userId);

    // Ensure the user modifying the data is the owner of the profile.
    if (String(req.user.id) !== String(req.params.userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only add education to your own profile.' });
    }
    
    const { error, value } = educationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const newEducation = await educationModel.create(req.params.userId, value);
    res.status(201).json({ success: true, data: newEducation, message: 'Education added successfully.' });
  } catch (err) {
    next(err); 
  }
};

export const updateEducation = async (req, res, next) => {
  try {
    // Ensure the user modifying the data is the owner of the profile.
    if (String(req.user.id) !== String(req.params.userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own education.' });
    }

    const { error, value } = educationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const updatedEducation = await educationModel.update(req.params.educationId, value);

    if (!updatedEducation) {
      return res.status(404).json({ success: false, message: 'Education not found.' });
    }
    
    res.json({ success: true, data: updatedEducation, message: 'Education updated successfully.' });
  } catch (err) {
    next(err);
  }
};

export const deleteEducation = async (req, res, next) => {
  try {
    console.log(
      'deleteEducation: req.user.id =', req.user.id,
      'req.params.userId =', req.params.userId,
      'req.params.educationId =', req.params.educationId
    );

    if (String(req.user.id) !== String(req.params.userId)) {
      console.log('Forbidden: user mismatch');
      return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own education.' });
    }

    const result = await educationModel.delete(req.params.educationId);
    console.log('delete result:', result);

    // Defensive for any model result: result could be undefined/null
    if (!result || !('affectedRows' in result) || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Education not found or already deleted.' });
    }

    res.status(200).json({ success: true, message: 'Education deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
