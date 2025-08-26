import pool from '../config/db.js';

export async function create({ name, email, subject = null, message }) {
  const { rows } = await pool.query(
    `INSERT INTO messages (name, email, subject, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *;`,
    [name, email, subject, message]
  );
  return rows[0];
}

export async function findAll({ page = 1, limit = 20 }) {
  const safeLimit = Math.min(Math.max(+limit || 20, 1), 100);
  const safePage = Math.max(+page || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const [{ rows: countRows }, { rows: itemsRows }] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total FROM messages;`),
    pool.query(
      `SELECT * FROM messages
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2;`,
      [safeLimit, offset]
    ),
  ]);

  return {
    total: countRows[0].total,
    page: safePage,
    limit: safeLimit,
    items: itemsRows,
  };
}

export async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM messages WHERE id = $1;`, [id]);
  return rows[0] || null;
}

export async function markRead(id) {
  const { rows } = await pool.query(
    `UPDATE messages
     SET read = TRUE, updated_at = NOW()
     WHERE id = $1
     RETURNING *;`,
    [id]
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rows } = await pool.query(
    `DELETE FROM messages
     WHERE id = $1
     RETURNING id;`,
    [id]
  );
  return rows[0] || null;
}
