// src/controllers/blogPostsController.js
import blogPostModel from '../models/blogPostModel.js';
import { blogPostSchema } from '../validators/blogPostValidators.js';


export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await blogPostModel.getAll(); // You need to implement this in your model!
    res.json({ success: true, data: posts, message: 'All blog posts retrieved.' });
  } catch (err) { next(err); }
};
export const getPosts = async (req, res, next) => {
  try {
    const posts = await blogPostModel.getAllByUser(req.params.userId);
    res.json({ success: true, data: posts, message: 'Blog posts retrieved.' });
  } catch (err) {
    next(err);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const post = await blogPostModel.getById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, data: post, message: 'Blog post retrieved.' });
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const { error, value } = blogPostSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const post = await blogPostModel.create({ user_id: req.params.userId, ...value });
    res.status(201).json({ success: true, data: post, message: 'Blog post created.' });
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await blogPostModel.getById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (req.user.id !== post.user_id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const { error, value } = blogPostSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const updated = await blogPostModel.update(req.params.id, value);
    res.json({ success: true, data: updated, message: 'Blog post updated.' });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await blogPostModel.getById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (req.user.id !== post.user_id) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    await blogPostModel.delete(req.params.id);
    res.json({ success: true, message: 'Blog post deleted.' });
  } catch (err) {
    next(err);
  }
};
