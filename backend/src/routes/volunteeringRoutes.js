import express from 'express';
import * as volunteeringController from '../controllers/volunteeringController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', volunteeringController.getVolunteerings);
router.post('/', authenticate, volunteeringController.createVolunteering);
router.put('/:volunteeringId', authenticate, volunteeringController.updateVolunteering);
router.delete('/:volunteeringId', authenticate, volunteeringController.deleteVolunteering);

export default router;
