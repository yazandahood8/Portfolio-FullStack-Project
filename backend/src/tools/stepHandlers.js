// src/tools/stepHandlers.js
import { projectSchema } from '../validators/projectValidators.js';
import { experienceSchema } from '../validators/experienceValidators.js';
import { educationSchema } from '../validators/educationValidators.js';
import { skillSchema } from '../validators/skillValidators.js';

import projectModel from '../models/projectModel.js';
import experienceModel from '../models/experienceModel.js';
import educationModel from '../models/educationModel.js';
import skillModel from '../models/skillModel.js';
import { updateModelContext } from '../MCP/modelContext.js';
import userModel from '../models/userModel.js';

// ---------- helpers ----------
const UUID_RX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const toArray = (v) =>
  Array.isArray(v) ? v
  : (typeof v === 'string' && v.trim())
    ? v.split(',').map(s => s.trim()).filter(Boolean)
    : [];

const asString = (v) =>
  (v === null || v === undefined) ? '' : (typeof v === 'string' ? v : String(v));

const asNumberOr = (v, fallback = 0) => {
  if (v === null || v === undefined || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function normalizeLevel(v) {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return 'Intermediate';
  const map = {
    advanced: 'Expert', senior: 'Expert', expert: 'Expert',
    mid: 'Intermediate', medium: 'Intermediate', intermediate: 'Intermediate',
    jr: 'Beginner', junior: 'Beginner', beginner: 'Beginner'
  };
  return map[s] || 'Intermediate';
}

function ok(message, extra = {}) { return { ok: true, message, ...extra }; }
function fail(msg) { const e = new Error(msg); e.expose = true; throw e; }
function ensureUserId(userId) {
  if (!userId || typeof userId !== 'string') fail('Missing required "userId".');
  if (!UUID_RX.test(userId)) fail('Invalid "userId" (must be UUID).');
}

// ---------- actions ----------
export async function createProject(params) {
  console.log('📩 createProject params:', params);
  const {
    userId,
    project_name,
    tech_stack,
    short_description,
    long_description,
    github_url,
    live_url,
    thumbnail_url,
    video_url,
    priority
  } = params;

  ensureUserId(userId);

  const validationInput = {
    project_name: asString(project_name),
    tech_stack: toArray(tech_stack),
    short_description: asString(short_description),
    long_description: asString(long_description),
    github_url: asString(github_url),
    live_url: asString(live_url),
    thumbnail_url: asString(thumbnail_url),
    video_url: asString(video_url),
    priority: asNumberOr(priority, 0)
  };

  const { error } = projectSchema.validate(validationInput);
  if (error) fail(`Joi error: ${error.message}`);

  const result = await projectModel.create({
    user_id: userId,
    ...validationInput
  });

  return ok(`Project "${result.project_name}" added.`, { result });
}

export async function deleteProject(params) {
  console.log('📩 deleteProject params:', params);
  const { id, userId } = params;
  ensureUserId(userId);
  if (!id) fail('Missing required "id".');
  await projectModel.delete(id);
  return ok(`Project ${id} deleted.`);
}

export async function createSkill(params) {
  console.log('📩 createSkill params (raw):', params);
  const { userId } = params;
  ensureUserId(userId);

  const skill_name = asString(params.skill_name ?? params.name ?? params.skill).trim();
  const level = normalizeLevel(params.level ?? params.proficiency ?? params.experience_level);
  const category = asString(params.category ?? params.group);

  const payload = { skill_name, level, category };
  console.log('🧽 createSkill normalized payload:', payload);

  const { error } = skillSchema.validate(payload);
  if (error) fail(`Joi error: ${error.message}`);

  const row = await skillModel.create({ user_id: userId, ...payload });
  return ok(`Skill "${row.skill_name}" added.`, { result: row });
}

export async function createExperience(params) {
  console.log('📩 createExperience params (raw):', params);
  const { userId } = params;
  ensureUserId(userId);

  const job_title = asString(params.job_title ?? params.title ?? params.position);
  const company_name = asString(params.company_name ?? params.company ?? params.employer ?? params.org);
  const location = asString(params.location ?? params.city);
  const start_date = asString(params.start_date ?? params.from ?? params.start);
  const is_current = !!(params.is_current ?? params.current ?? params.currently);
  const end_date = is_current ? null : asString(params.end_date ?? params.to ?? params.end);
  const description = asString(params.description ?? params.desc);

  const payload = { job_title, company_name, location, start_date, end_date, is_current, description };
  console.log('🧽 createExperience normalized payload:', payload);

  const { error } = experienceSchema.validate(payload);
  if (error) fail(`Joi error: ${error.message}`);

  const row = await experienceModel.create({ user_id: userId, ...payload });
  return ok(`Experience "${row.job_title} @ ${row.company_name}" added.`, { result: row });
}

export async function createEducation(params) {
  console.log('📩 createEducation params (raw):', params);
  const { userId } = params;
  ensureUserId(userId);

  const school_name = asString(params.school_name ?? params.school ?? params.university);
  const degree = asString(params.degree ?? params.program);
  const field_of_study = asString(params.field_of_study ?? params.major ?? params.field);
  const start_date = asString(params.start_date ?? params.from);
  const is_current = !!(params.is_current ?? params.current);
  const end_date = is_current ? '' : asString(params.end_date ?? params.to);
  const description = asString(params.description ?? params.desc);

  const payload = { school_name, degree, field_of_study, start_date, end_date, is_current, description };
  console.log('🧽 createEducation normalized payload:', payload);

  const { error } = educationSchema.validate(payload);
  if (error) fail(`Joi error: ${error.message}`);

  const row = await educationModel.create(userId, payload);
  return ok(`Education "${row.school_name}" added.`, { result: row });
}

export async function updateUserProfile(params) {
  console.log('📩 updateUserProfile params:', params);
  const { userId, ...profile } = params;
  ensureUserId(userId);

  // 1) sanitize & split fields
  const asString = (v) => (v == null ? '' : String(v));
  const clean = Object.fromEntries(
    Object.entries(profile).map(([k, v]) => [k, asString(v)])
  );

  // Known columns in users table (adjust if your schema differs)
  // From your model's SELECT you at least have: full_name, email, phone, location, profile_image_url, bio, about
  // We'll also try 'headline' and 'languages' if they exist in your schema (ignored if not).
  const ALLOWED_COLS = new Set([
    'full_name',  'phone', 'location',
    'profile_image_url', 'bio', 'about'
     
  ]);

  const dataToUpdate = {};
  for (const [k, v] of Object.entries(clean)) {
    if (ALLOWED_COLS.has(k)) dataToUpdate[k] = v;
  }

  // 2) Update users table (only if we have valid columns)
  let userRow = null;
  if (Object.keys(dataToUpdate).length) {
    try {
      userRow = await userModel.update(userId, dataToUpdate);
    } catch (e) {
      console.error('❌ userModel.update failed:', e.message);
      // Helpful hint if column missing
      if (/column .* does not exist/i.test(e.message)) {
        console.warn('One of the fields is not a column in users. Remove it or add a migration.');
      }
      throw e;
    }
  } else {
    console.warn('updateUserProfile: no allowed columns in payload; skipping users update.');
    userRow = await userModel.getById(userId); // still return something
  }

  // 3) Upsert social links (user_social_links)
  const links = {
    linkedin: clean.linkedin,
    github: clean.github,
    website: clean.website,
    twitter: clean.twitter,
    facebook: clean.facebook,
    instagram: clean.instagram
  };

  const ensureUrl = (u) => {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    return `https://${u}`;
  };
  const normalizePlatform = (p) => {
  const s = String(p || '').trim().toLowerCase();
  const map = {
    linkedin: 'linkedin', 'linked-in': 'linkedin', 'linked in': 'linkedin',
    github: 'github', 'git hub': 'github',
    x: 'twitter', twitter: 'twitter',
    website: 'website', site: 'website', portfolio: 'website', personal: 'website',
    facebook: 'facebook', fb: 'facebook',
    instagram: 'instagram', ig: 'instagram',
    youtube: 'youtube', yt: 'youtube',
    medium: 'medium',
    stackoverflow: 'stackoverflow', 'stack overflow': 'stackoverflow',
    leetcode: 'leetcode', codeforces: 'codeforces', kaggle: 'kaggle',
    behance: 'behance', dribbble: 'dribbble', devto: 'devto', 'dev.to': 'devto'
  };
  return map[s] || s; // allow custom platforms too
};

  for (const [platform, url] of Object.entries(links)) {
    const u = ensureUrl(url);
    if (u) {
      try {
        await userModel.upsertSocialLink(userId, platform, u, platform === 'github' ? 'GitHub' :
                                                    platform === 'linkedin' ? 'LinkedIn' :
                                                    platform.charAt(0).toUpperCase() + platform.slice(1));
      } catch (e) {
        console.error(`⚠️ Failed to upsert social link ${platform}:`, e.message);
      }
    }
  }

  // 4) Done
  return ok('User profile updated.', {
    result: { userId, updated: dataToUpdate, social_links: Object.fromEntries(
      Object.entries(links).filter(([_, v]) => !!v)
    )}
  });
}
export async function createSocialLinks(params) {
  console.log('📩 createSocialLinks params:', params);
  const { userId, links } = params;
  ensureUserId(userId);
  if (!Array.isArray(links) || links.length === 0) fail('links[] is required.');

  const results = [];
  for (const item of links) {
    const platform = normalizePlatform(item.platform);
    const url = ensureUrl(item.url);
    const display_name =
      item.display_name ||
      (platform === 'github' ? 'GitHub'
        : platform === 'linkedin' ? 'LinkedIn'
        : platform.charAt(0).toUpperCase() + platform.slice(1));

    if (!platform || !url) {
      results.push({ platform, ok: false, error: 'Missing platform or url' });
      continue;
    }
    try {
      await userModel.upsertSocialLink(userId, platform, url, display_name);
      results.push({ platform, ok: true });
    } catch (e) {
      results.push({ platform, ok: false, error: e.message });
    }
  }

  return ok('Social links processed.', { results });
}
export const actions = {
  createProject,
  deleteProject,
  createSkill,
  createExperience,
  createEducation,
  updateUserProfile,
  createSocialLinks
};

export default actions;
