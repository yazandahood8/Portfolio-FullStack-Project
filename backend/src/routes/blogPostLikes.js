// backend/src/routes/blogPostLikes.js
import { Router } from 'express';
import {
  likePost,
  unlikePost,
  getLikeCount,
  getUserLikeStatus,
} from '../controllers/blogPostLikeController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router({ mergeParams: true }); // ⬅️ THIS IS ESSENTIAL!

router.post('/', authenticate, likePost);
router.delete('/', authenticate, unlikePost);
router.get('/count', getLikeCount);
router.get('/me', authenticate, getUserLikeStatus);

export default router;
