import { Router } from 'express';
import {
  addComment, getComments, getCommentCount, removeComment
} from '../controllers/blogPostCommentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router({ mergeParams: true });

router.post('/', authenticate, addComment);
router.get('/', getComments);
router.get('/count', getCommentCount);
router.delete('/:commentId', authenticate, removeComment);

export default router;
