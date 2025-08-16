// src/routes/experienceRoutes.js
import { Router } from 'express';
import {
  getExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience
} from '../controllers/experiencesController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router({ mergeParams: true });

router.get('/', getExperiences);
router.get('/:id', getExperience);
router.post('/', authenticate, createExperience);
router.put('/:id', authenticate, updateExperience);
router.delete('/:id', authenticate, deleteExperience);

export default router;
