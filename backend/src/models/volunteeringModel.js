// backend/src/models/volunteeringModel.js
import pool from '../config/db.js';

const ALLOWED_FIELDS = new Set([
  'organization',
  'role',
  'location',
  'start_date',
  'end_date',
  'is_current',
  'description',
]);

// ---- date helpers: תמיד מחזיר YYYY-MM-DD או null (לפי הזמן המקומי) ----
const pad = (n) => String(n).padStart(2, '0');
function formatYMDLocal(dateObj) {
  const y = dateObj.getFullYear();
  const m = pad(dateObj.getMonth() + 1);
  const d = pad(dateObj.getDate());
  return `${y}-${m}-${d}`;
}
function toYMD(v, allowNull = false) {
  if (v === undefined || v === null || v === '') return allowNull ? null : '';
  if (typeof v === 'string') {
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/); // "2025-09-02" או "2025-09-02T..."
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    const d = new Date(v);
    if (!isNaN(d)) return formatYMDLocal(d);
    return allowNull ? null : '';
  }
  if (v instanceof Date && !isNaN(v)) return formatYMDLocal(v);
  return allowNull ? null : '';
}

function buildUpdateSetVals(data) {
  let idx = 1;
  const set = [];
  const vals = [];

  for (const [k, raw] of Object.entries(data)) {
    if (!ALLOWED_FIELDS.has(k)) continue;
    if (raw === undefined) continue;

    if (k === 'start_date' || k === 'end_date') {
      const v = toYMD(raw, true);
      if (v === null) {
        set.push(`${k} = NULL`);
      } else {
        set.push(`${k} = $${idx}::date`);
        vals.push(v);
        idx++;
      }
      continue;
    }

    set.push(`${k} = $${idx}`);
    vals.push(raw);
    idx++;
  }

  return { set, vals };
}

const volunteeringModel = {
  async create(user_id, data) {
    const payload = {
      organization: (data.organization ?? '').trim(),
      role: (data.role ?? '').trim(),
      location: (data.location ?? '').trim(),
      start_date: toYMD(data.start_date, true),
      end_date: data.is_current ? null : toYMD(data.end_date, true),
      is_current: !!data.is_current,
      description: (data.description ?? '').trim(),
    };

    const { rows } = await pool.query(
      `INSERT INTO volunteerings (
        user_id, organization, role, location, start_date, end_date, is_current, description
      ) VALUES ($1,$2,$3,$4,$5::date,$6::date,$7,$8)
       RETURNING *`,
      [
        user_id,
        payload.organization,
        payload.role,
        payload.location,
        payload.start_date,
        payload.end_date,
        payload.is_current,
        payload.description,
      ],
    );
    return rows[0];
  },

  async getAllByUser(user_id) {
    const { rows } = await pool.query(
      `SELECT * FROM volunteerings
        WHERE user_id = $1
        ORDER BY start_date DESC NULLS LAST, created_at DESC`,
      [user_id],
    );
    return rows;
  },

  async update(user_id, id, data) {
    const normalized = {
      organization: data.organization,
      role: data.role,
      location: data.location,
      start_date: data.start_date,
      end_date: data.end_date,
      is_current: data.is_current,
      description: data.description,
    };
    const { set, vals } = buildUpdateSetVals(normalized);
    if (set.length === 0) throw new Error('No valid fields to update');

    const sql = `
      UPDATE volunteerings
         SET ${set.join(', ')}, updated_at = now()
       WHERE id = $${vals.length + 1} AND user_id = $${vals.length + 2}
       RETURNING *`;
    const { rows } = await pool.query(sql, [...vals, id, user_id]);
    return rows[0] ?? null;
  },

  async delete(user_id, id) {
    const result = await pool.query(
      `DELETE FROM volunteerings WHERE id = $1 AND user_id = $2`,
      [id, user_id],
    );
    return { affectedRows: result.rowCount };
  },
};

export default volunteeringModel;
