// backend/src/routes/blogPosts.js
import { Router } from 'express';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getAllPosts
} from '../controllers/blogPostsController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadBlogImage.js';
import blogPostLikes from './blogPostLikes.js';
import blogPostComments from './blogPostComments.js';

const router = Router({ mergeParams: true });

// Upload image endpoint
router.post(
  '/upload-image',
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const url = `/uploads/blog-covers/${req.file.filename}`;
    res.json({ success: true, url, message: 'Image uploaded.' });
  }
);

// Blog post CRUD
router.get('/all', getAllPosts);
router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

router.use('/:postId/likes', blogPostLikes);
router.use('/:postId/comments', blogPostComments);

export default router;
