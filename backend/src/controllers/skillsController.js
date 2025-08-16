// src/controllers/skillsController.js
import skillModel from '../models/skillModel.js';
import { skillSchema } from '../validators/skillValidators.js';

export const getSkills = async (req, res, next) => {
  try {
    const skills = await skillModel.getAllByUser(req.params.userId);
    res.json({ success: true, data: skills, message: 'Skills retrieved.' });
  } catch (err) {
    next(err);
  }
};

export const getSkill = async (req, res, next) => {
  try {
    const skill = await skillModel.getById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found.' });
    res.json({ success: true, data: skill, message: 'Skill retrieved.' });
  } catch (err) {
    next(err);
  }
};

export const createSkill = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const { error, value } = skillSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const skill = await skillModel.create({ user_id: req.params.userId, ...value });
    res.status(201).json({ success: true, data: skill, message: 'Skill created.' });
  } catch (err) {
    next(err);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    const skill = await skillModel.getById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found.' });
    if (req.user.id !== skill.user_id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const { error, value } = skillSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const updated = await skillModel.update(req.params.id, value);
    res.json({ success: true, data: updated, message: 'Skill updated.' });
  } catch (err) {
    next(err);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await skillModel.getById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found.' });
    if (req.user.id !== skill.user_id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    await skillModel.delete(req.params.id);
    res.json({ success: true, message: 'Skill deleted.' });
  } catch (err) {
    next(err);
  }
};
