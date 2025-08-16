import db from '../config/db.js';

export const addComment = async (postId, userId, author_name, text) => {
  const { rows } = await db.query(
    `INSERT INTO blog_post_comments (post_id, user_id, author_name, text)
     VALUES ($1, $2, $3, $4) RETURNING *`, [postId, userId, author_name, text]);
  return rows[0];
};

export const getComments = async postId => {
  const { rows } = await db.query(
    `SELECT * FROM blog_post_comments WHERE post_id = $1 ORDER BY created_at ASC`, [postId]);
  return rows;
};

export const getCommentCount = async postId => {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count FROM blog_post_comments WHERE post_id = $1`, [postId]);
  return rows[0].count;
};

export const removeComment = async (commentId, userId) => {
  await db.query(
    `DELETE FROM blog_post_comments WHERE id = $1 AND (user_id = $2 OR $2 IS NULL)`, [commentId, userId]);
};
