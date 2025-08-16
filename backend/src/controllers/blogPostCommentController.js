import * as CommentModel from '../models/blogPostCommentModel.js';

export const addComment = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user?.id || null;
  const { author_name, text } = req.body;
  const comment = await CommentModel.addComment(postId, userId, author_name, text);
  res.json({ success: true, data: comment });
};

export const getComments = async (req, res) => {
  const { postId } = req.params;
  const comments = await CommentModel.getComments(postId);
  res.json({ success: true, data: comments });
};

export const getCommentCount = async (req, res) => {
  const { postId } = req.params;
  const count = await CommentModel.getCommentCount(postId);
  res.json({ success: true, data: { count } });
};

export const removeComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user?.id || null;
  await CommentModel.removeComment(commentId, userId);
  res.json({ success: true, message: 'Comment deleted' });
};
