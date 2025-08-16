// backend/src/models/educationModel.js
import pool from '../config/db.js';

const ALLOWED_FIELDS = new Set([
  'school_name',
  'degree',
  'field_of_study',
  'start_date',
  'end_date',
  'is_current',
  'description',
]);

// ---- date helpers: תמיד מחזיר YYYY-MM-DD או null ----
function pad(n) { return String(n).padStart(2, '0'); }
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

function normalizeEducationInput(src = {}) {
  const payload = {
    school_name: (src.school_name ?? '').trim(),
    degree: (src.degree ?? '').trim(),
    field_of_study: (src.field_of_study ?? '').trim(),
    start_date: toYMD(src.start_date, true),                 // YYYY-MM-DD | null
    end_date: toYMD(src.end_date, true),                     // YYYY-MM-DD | null
    is_current: !!src.is_current,
    description: (src.description ?? '').trim(),
  };
  if (payload.is_current) payload.end_date = null;
  return payload;
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

const educationModel = {
  async create(user_id, data) {
    const p = normalizeEducationInput(data);
    const { rows } = await pool.query(
      `INSERT INTO educations (
         user_id, school_name, degree, field_of_study, start_date, end_date, is_current, description
       ) VALUES ($1,$2,$3,$4,$5::date,$6::date,$7,$8)
       RETURNING *`,
      [user_id, p.school_name, p.degree, p.field_of_study, p.start_date, p.end_date, p.is_current, p.description]
    );
    return rows[0];
  },

  async getAllByUser(user_id) {
    const { rows } = await pool.query(
      `SELECT * FROM educations
       WHERE user_id = $1
       ORDER BY start_date DESC NULLS LAST, created_at DESC`,
      [user_id]
    );
    return rows;
  },

  // ⚠ תומך גם ב-update(id, data) (מה-controller שלך)
  // ⚠ וגם ב-update(user_id, id, data) למקרה שיש קוד ישן
  async update(a, b, c) {
    let user_id = null, id = null, data = null;

    if (typeof a === 'string' && typeof b === 'object' && c === undefined) {
      // update(id, data)
      id = a;
      data = b;
    } else if (typeof a === 'string' && typeof b === 'string' && typeof c === 'object') {
      // update(user_id, id, data)
      user_id = a;
      id = b;
      data = c;
    } else {
      throw new Error('Invalid arguments for educationModel.update');
    }

    const normalized = normalizeEducationInput(data);
    const { set, vals } = buildUpdateSetVals(normalized);
    if (set.length === 0) throw new Error('No valid fields to update');

    let sql, params;
    if (user_id) {
      sql = `
        UPDATE educations
           SET ${set.join(', ')}, updated_at = now()
         WHERE id = $${vals.length + 1} AND user_id = $${vals.length + 2}
         RETURNING *`;
      params = [...vals, id, user_id];
    } else {
      sql = `
        UPDATE educations
           SET ${set.join(', ')}, updated_at = now()
         WHERE id = $${vals.length + 1}
         RETURNING *`;
      params = [...vals, id];
    }

    const { rows } = await pool.query(sql, params);
    return rows[0] ?? null;
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM educations WHERE id = $1', [id]);
    return { affectedRows: result.rowCount };
  },
};

export default educationModel;
