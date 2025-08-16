// src/models/experienceModel.js
import pool from '../config/db.js';

const experienceModel = {
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const cols = keys.join(', ');
    const params = keys.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `INSERT INTO experiences (${cols})
       VALUES (${params})
       RETURNING *`,
      values
    );
    return rows[0];
  },

  async getAllByUser(userId) {
    const { rows } = await pool.query(
      `SELECT * FROM experiences WHERE user_id = $1 ORDER BY start_date DESC`,
      [userId]
    );
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM experiences WHERE id = $1`,
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
      `UPDATE experiences
       SET ${setString}
       WHERE id = $${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query(
      `DELETE FROM experiences WHERE id = $1`,
      [id]
    );
  }
};

export default experienceModel;
