import express from 'express';
import * as certificationController from '../controllers/certificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// All routes are /api/v1/users/:userId/certifications/...
router.get('/', certificationController.getCertifications);
router.post('/', authenticate, certificationController.createCertification);
router.put('/:certificationId', authenticate, certificationController.updateCertification);
router.delete('/:certificationId', authenticate, certificationController.deleteCertification);

export default router;
