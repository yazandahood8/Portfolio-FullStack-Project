// src/routes/skillRoutes.js
import { Router } from 'express';
import {
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill
} from '../controllers/skillsController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router({ mergeParams: true });

router.get('/', getSkills);
router.get('/:id', getSkill);
router.post('/', authenticate, createSkill);
router.put('/:id', authenticate, updateSkill);
router.delete('/:id', authenticate, deleteSkill);

export default router;
