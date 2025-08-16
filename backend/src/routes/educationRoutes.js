import express from 'express';
import * as educationController from '../controllers/educationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// All routes are /api/v1/users/:userId/educations/...
router.get('/', educationController.getEducations);
router.post('/', authenticate, educationController.createEducation);
router.put('/:educationId', authenticate, educationController.updateEducation);
router.delete('/:educationId', authenticate, educationController.deleteEducation);

export default router;
