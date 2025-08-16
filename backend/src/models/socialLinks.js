// models/socialLinks.js
const db = require('../db'); // pg Pool instance

async function getSocialLinksForUser(userId) {
  const { rows } = await db.query(
    `SELECT platform, url, display_name
     FROM user_social_links
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId]
  );
  return rows;
}

module.exports = { getSocialLinksForUser };
