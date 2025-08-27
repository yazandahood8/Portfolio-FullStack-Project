import express from 'express';
import * as educationController from '../controllers/educationController.js';
import { authenticate, authorizeOwnerOrAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// /api/v1/users/:userId/educations

// Public reads
router.get('/', educationController.getEducations);

// Writes: must be logged-in AND owner/admin
router.post('/', authenticate, authorizeOwnerOrAdmin, educationController.createEducation);
router.put('/:educationId', authenticate, authorizeOwnerOrAdmin, educationController.updateEducation);
router.delete('/:educationId', authenticate, authorizeOwnerOrAdmin, educationController.deleteEducation);

export default router;
