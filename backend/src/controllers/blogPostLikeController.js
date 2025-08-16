import * as LikeModel from '../models/blogPostLikeModel.js';

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    await LikeModel.addLike(postId, userId);
    res.json({ success: true, message: 'Liked' });
  } catch (err) {
    console.error('likePost error:', err); // <= see real reason!
    res.status(500).json({ success: false, message: err.message });
  }
};
export const unlikePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  await LikeModel.removeLike(postId, userId);
  res.json({ success: true, message: 'Unliked' });
};

export const getLikeCount = async (req, res) => {
  const { postId } = req.params;
  const count = await LikeModel.getLikeCount(postId);
  res.json({ success: true, data: { count } });
};

// ---- This is the one you forgot to export! ----
export const getUserLikeStatus = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  const liked = await LikeModel.hasUserLiked(postId, userId);
  res.json({ success: true, data: { liked } });
};
