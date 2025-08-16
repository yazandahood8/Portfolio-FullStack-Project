// src/routes/projectRoutes.js
import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectsController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router({ mergeParams: true });

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', authenticate, createProject);
router.put('/:id', authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);

export default router;
