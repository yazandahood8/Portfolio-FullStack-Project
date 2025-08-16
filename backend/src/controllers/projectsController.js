// src/controllers/projectsController.js
import projectModel from '../models/projectModel.js';
import { projectSchema } from '../validators/projectValidators.js';

export const getProjects = async (req, res, next) => {
  try {
    const projs = await projectModel.getAllByUser(req.params.userId);
    res.json({ success: true, data: projs, message: 'Projects retrieved.' });
  } catch (err) {
    next(err);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const proj = await projectModel.getById(req.params.id);
    if (!proj) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, data: proj, message: 'Project retrieved.' });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const { error, value } = projectSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const proj = await projectModel.create({ user_id: req.params.userId, ...value });
    res.status(201).json({ success: true, data: proj, message: 'Project created.' });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const proj = await projectModel.getById(req.params.id);
    if (!proj) return res.status(404).json({ success: false, message: 'Project not found.' });
    if (req.user.id !== proj.user_id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const { error, value } = projectSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const updated = await projectModel.update(req.params.id, value);
    res.json({ success: true, data: updated, message: 'Project updated.' });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const proj = await projectModel.getById(req.params.id);
    if (!proj) return res.status(404).json({ success: false, message: 'Project not found.' });
    if (req.user.id !== proj.user_id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    await projectModel.delete(req.params.id);
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    next(err);
  }
};
