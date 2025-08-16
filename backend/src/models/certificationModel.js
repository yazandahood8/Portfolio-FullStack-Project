import pool from '../config/db.js';

const certificationModel = {
  async create(user_id, data) {
    const {
      name,
      organization = '',
      credential_id = '',
      credential_url = '',
      issued_date = null,
      expiration_date = null,
      does_not_expire = false,
      description = ''
    } = data;
    const { rows } = await pool.query(
      `INSERT INTO certifications (
        user_id, name, organization, credential_id, credential_url,
        issued_date, expiration_date, does_not_expire, description
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [user_id, name, organization, credential_id, credential_url, issued_date, expiration_date, does_not_expire, description]
    );
    return rows[0];
  },

  async getAllByUser(user_id) {
    const { rows } = await pool.query(
      `SELECT * FROM certifications WHERE user_id = $1 ORDER BY issued_date DESC NULLS LAST`,
      [user_id]
    );
    return rows;
  },

  async update(user_id, id, data) {
    const keys = Object.keys(data);
    const values = keys.map(k => data[k]);
    const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE certifications SET ${setString}, updated_at = now()
       WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2} RETURNING *`,
      [...values, id, user_id]
    );
    return rows[0];
  },

  async delete(user_id, id) {
    await pool.query(
      `DELETE FROM certifications WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
  }
};

export default certificationModel;
