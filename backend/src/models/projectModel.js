// src/models/projectModel.js
import pool from '../config/db.js';

const projectModel = {
  async create(data) {
      console.log('🧩 Calling DB with:', data);

    // Always destructure and supply all required/default fields (avoid missing/undefined fields)
    const {
      user_id,
      project_name,
      short_description = "",
      long_description = "",
      thumbnail_url = "",
      github_url = "",
      live_url = "",
      tech_stack = [],
      priority = 0,
      video_url = ""
    } = data;

    const { rows } = await pool.query(
      `INSERT INTO projects (
        user_id, project_name, short_description, long_description,
        thumbnail_url, github_url, live_url, tech_stack, priority, video_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        user_id,
        project_name,
        short_description,
        long_description,
        thumbnail_url,
        github_url,
        live_url,
        JSON.stringify(tech_stack),  // <-- Ensure Postgres JSONB!
        priority,
        video_url
      ]
    );
    return rows[0];
  },

  async getAllByUser(userId) {
    const { rows } = await pool.query(
      `SELECT * FROM projects WHERE user_id = $1 ORDER BY priority ASC`,
      [userId]
    );
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM projects WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  async update(id, data) {
    // Same fix: if updating tech_stack, use JSON.stringify, fill in missing defaults if needed.
    const keys = Object.keys(data);
    const values = keys.map(key =>
      key === 'tech_stack'
        ? JSON.stringify(data[key])
        : data[key]
    );
    const setString = keys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');

    const { rows } = await pool.query(
      `UPDATE projects
       SET ${setString}
       WHERE id = $${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query(
      `DELETE FROM projects WHERE id = $1`,
      [id]
    );
  }
};

export default projectModel;
