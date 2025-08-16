// src/controllers/experiencesController.js
import experienceModel from '../models/experienceModel.js';
import { experienceSchema } from '../validators/experienceValidators.js';

export const getExperiences = async (req, res, next) => {
  try {
    const exps = await experienceModel.getAllByUser(req.params.userId);
    res.json({ success: true, data: exps, message: 'Experiences retrieved.' });
  } catch (err) {
    next(err);
  }
};

export const getExperience = async (req, res, next) => {
  try {
    const exp = await experienceModel.getById(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Experience not found.' });
    res.json({ success: true, data: exp, message: 'Experience retrieved.' });
  } catch (err) {
    next(err);
  }
};

export const createExperience = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const { error, value } = experienceSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const exp = await experienceModel.create({ user_id: req.params.userId, ...value });
    res.status(201).json({ success: true, data: exp, message: 'Experience created.' });
  } catch (err) {
    next(err);
  }
};

export const updateExperience = async (req, res, next) => {
  try {
    const exp = await experienceModel.getById(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Experience not found.' });
    if (req.user.id !== exp.user_id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const { error, value } = experienceSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const updated = await experienceModel.update(req.params.id, value);
    res.json({ success: true, data: updated, message: 'Experience updated.' });
  } catch (err) {
    next(err);
  }
};

export const deleteExperience = async (req, res, next) => {
  try {
    const exp = await experienceModel.getById(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: 'Experience not found.' });
    if (req.user.id !== exp.user_id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    await experienceModel.delete(req.params.id);
    res.json({ success: true, message: 'Experience deleted.' });
  } catch (err) {
    next(err);
  }
};
