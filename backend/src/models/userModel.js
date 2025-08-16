import pool from '../config/db.js';

const userModel = {
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const cols = keys.join(', ');
    const params = keys.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `INSERT INTO users (${cols})
       VALUES (${params})
       RETURNING *`,
      values
    );
    return rows[0];
  },

  async getByEmail(email) {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return rows[0];
  },

  async getById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  async getSocialLinks(userId) {
    const { rows } = await pool.query(
      `SELECT platform, url, display_name
       FROM user_social_links
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [userId]
    );
    return rows;
  },

  async getAll({ skill, location }) {
    let sql = 'SELECT DISTINCT u.* FROM users u';
    const conditions = [];
    const values = [];

    if (skill) {
      sql += ' JOIN skills s ON u.id = s.user_id';
      values.push(skill);
      conditions.push(`s.skill_name = $${values.length}`);
    }
    if (location) {
      values.push(location);
      conditions.push(`u.location = $${values.length}`);
    }
    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const { rows } = await pool.query(sql, values);
    return rows;
  },

  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setString = keys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');

    const { rows } = await pool.query(
      `UPDATE users
       SET ${setString}, updated_at = now()
       WHERE id = $${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query(
      `DELETE FROM users WHERE id = $1`,
      [id]
    );
  },
  
  // Main helper: user with social_links
  async getByIdWithSocialLinks(userId) {
    const { rows } = await pool.query(
      `SELECT id, full_name, email, phone, location, profile_image_url, bio, about
     FROM users WHERE id = $1`,
      [userId]
    );
    if (!rows[0]) return null;
    const user = rows[0];
    user.social_links = await this.getSocialLinks(userId);
    return user;
  },


  async upsertSocialLink(userId, platform, url, display_name = '') {
    // Try update first
    const upd = await pool.query(
      `UPDATE user_social_links
         SET url = $3, display_name = $4, updated_at = now()
       WHERE user_id = $1 AND platform = $2`,
      [userId, platform, url, display_name]
    );
    if (upd.rowCount > 0) return;

    // Insert if not exists
    await pool.query(
      `INSERT INTO user_social_links (user_id, platform, url, display_name)
       VALUES ($1, $2, $3, $4)`,
      [userId, platform, url, display_name]
    );
  },

  async setSocialLinks(userId, links /* {platform: {url, display_name}} */) {
    for (const [platform, cfg] of Object.entries(links || {})) {
      if (!cfg?.url) continue;
      await this.upsertSocialLink(userId, platform, cfg.url, cfg.display_name || '');
    }
  },

};

export default userModel;
