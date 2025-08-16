// src/models/blogPostModel.js
import pool from '../config/db.js';

const blogPostModel = {
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const cols = keys.join(', ');
    const params = keys.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `INSERT INTO blog_posts (${cols})
       VALUES (${params})
       RETURNING *`,
      values
    );
    return rows[0];
  },
  async getAll() {
    const { rows } = await pool.query(
      `SELECT * FROM blog_posts ORDER BY published_at DESC NULLS LAST, created_at DESC`
    );
    return rows;
  },
  async getAllByUser(userId) {
    const { rows } = await pool.query(
      `SELECT * FROM blog_posts WHERE user_id = $1 ORDER BY published_at DESC NULLS LAST`,
      [userId]
    );
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM blog_posts WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setString = keys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');

    const { rows } = await pool.query(
      `UPDATE blog_posts
       SET ${setString}, updated_at = now()
       WHERE id = $${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query(
      `DELETE FROM blog_posts WHERE id = $1`,
      [id]
    );
  }
};

export default blogPostModel;
