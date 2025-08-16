// src/routes/userRoutes.js
import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/usersController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { getCV, getCVAi, regenerateCVAi } from '../controllers/cvController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { uploadProfileImage } from '../controllers/uploadController.js';
import educationRoutes from './educationRoutes.js';
import certificationRoutes from './certificationRoutes.js';
import volunteeringRoutes from './volunteeringRoutes.js';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);
router.get('/:id/cv', authenticate, getCV);
router.get('/:id/cvAiPdf', authenticate, getCVAi);
router.post('/:id/cvAiPdf/regenerate', authenticate, regenerateCVAi); // << ADD THIS LINE

router.post(
  '/:id/photo',
  authenticate,
  upload.single('image'),
  uploadProfileImage
);
router.use('/:userId/educations', authenticate, educationRoutes);
router.use('/:id/certifications',authenticate, certificationRoutes);
router.use('/:id/volunteerings',authenticate, volunteeringRoutes);

export default router;
