import db from '../config/db.js';

export const addLike = async (postId, userId) => {
  await db.query(
    `INSERT INTO blog_post_likes (post_id, user_id) VALUES ($1, $2)
     ON CONFLICT (post_id, user_id) DO NOTHING`, [postId, userId]);
};

export const removeLike = async (postId, userId) => {
  await db.query(
    `DELETE FROM blog_post_likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
};

export const getLikeCount = async postId => {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count FROM blog_post_likes WHERE post_id = $1`, [postId]);
  return rows[0].count;
};

export const hasUserLiked = async (postId, userId) => {
  const { rows } = await db.query(
    `SELECT 1 FROM blog_post_likes WHERE post_id = $1 AND user_id = $2 LIMIT 1`,
    [postId, userId]
  );
  return rows.length > 0;
};
