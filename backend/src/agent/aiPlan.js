// src/agent/aiPlan.js
import { callGemini } from '../tools/geminiTool.js';

const SUPPORTED = new Set([
  'createProject','deleteProject','createSkill','createExperience','createEducation','updateUserProfile'
]);

const stripFences = (s) => String(s).replace(/```json/gi,'').replace(/```/g,'').trim();
function extractJSONArray(s){
  try { return JSON.parse(s); } catch {}
  const a = s.indexOf('['), b = s.lastIndexOf(']');
  if (a !== -1 && b !== -1 && b > a) { try { return JSON.parse(s.slice(a, b + 1)); } catch {} }
  const os = s.indexOf('{'), oe = s.lastIndexOf('}');
  if (os !== -1 && oe !== -1 && oe > os) { try { return [JSON.parse(s.slice(os, oe + 1))]; } catch {} }
  throw new Error('Invalid JSON returned by model.');
}
const coerceTechStack = (v) =>
  Array.isArray(v) ? v : (typeof v === 'string'
    ? v.split(',').map(s => s.trim()).filter(Boolean)
    : []);

function buildPrompt(userMessage) {
  return `
You are an API-oriented backend assistant for an automated portfolio builder.
Return ONLY a valid JSON array of action objects — no Markdown, no prose.

Allowed actions: ["createProject","deleteProject","createSkill","createExperience","createEducation","updateUserProfile"]

Each item = { "action": <one of above>, "params": { ... } }

Schemas:
createProject.params = {
  "userId": string (required),
  "project_name": string (required),
  "tech_stack": string[] | comma-separated string (required),
  "short_description": string,
  "long_description": string,
  "github_url": string,
  "live_url": string,
  "thumbnail_url": string,
  "video_url": string,
  "priority": integer
}
deleteProject.params = { "id": string|number (required), "userId": string (required) }
createSkill.params = { "userId": string, "skill_name": string, "level": "Beginner"|"Intermediate"|"Expert", "category": string }
createExperience.params = { "userId": string, "job_title": string, "company_name": string, "location": string, "start_date": string, "end_date": string|null, "is_current": boolean, "description": string }
createEducation.params = { "userId": string, "school_name": string, "degree": string, "field_of_study": string, "start_date": string, "end_date": string, "is_current": boolean, "description": string }
updateUserProfile.params = { "userId": string, ...free form... }

If a field is not provided by the user, omit it or use an empty string.

User says: "${userMessage}"

Return only the array.`;
}

/* -------- Local fallback if Gemini is unavailable -------- */
function parseUrls(text) {
  const urls = Array.from(String(text || '').matchAll(/https?:\/\/\S+/g)).map(m => m[0]);
  const github_url = urls.find(u => /github\.com/i.test(u)) || '';
  const video_url = urls.find(u => /(youtube\.com|youtu\.be|linkedin\.com\/feed\/update)/i.test(u)) || '';
  const live_url  = urls.find(u => /(vercel\.app|netlify\.app|render\.com|onrender\.com|fly\.io)/i.test(u)) || '';
  const thumbnail_url = urls.find(u => /(uploads|\.png|\.jpg|\.jpeg)$/i.test(u)) || '';
  return { github_url, video_url, live_url, thumbnail_url };
}
function parseTechStackHeuristic(text) {
  const m = String(text).match(/\(([^)]+)\)/);
  if (m) return m[1].split(',').map(s => s.trim()).filter(Boolean);
  const KNOWN = ['Python','OpenCV','MediaPipe','TensorFlow','PyTorch','Flask','FastAPI','Django','Node.js','React','Angular','Java','Android','Spring Boot','Docker'];
  return KNOWN.filter(t => new RegExp(`\\b${t.replace('.', '\\.')}\\b`, 'i').test(text));
}
const firstSentence = (t) => (String(t).trim().split(/(?<=\.)\s+/)[0] || String(t)).slice(0, 200);

function derivePlanFromText(userId, textRaw) {
  const text = String(textRaw || '');
  if (/^\s*add\s+skill:/i.test(text)) {
    const m = text.match(/add\s+skill:\s*([^,(]+)\s*(?:\((Beginner|Intermediate|Expert)\))?(?:.*?\bcategory\b\s+([A-Za-z0-9 +#.\-]+))?/i);
    const skill_name = m?.[1]?.trim() || 'Skill';
    const level = m?.[2]?.trim() || 'Intermediate';
    const category = m?.[3]?.trim() || '';
    return [{ action: 'createSkill', params: { userId, skill_name, level, category } }];
  }
  if (/^\s*add\s+experience:/i.test(text)) {
    const head = (text.match(/add\s+experience:\s*([^\.]+)/i)?.[1] || '').trim();
    const parts = head.split(',').map(s => s.trim()).filter(Boolean);
    const job_title = parts[0] || 'Role';
    const company_name = parts[1] || 'Company';
    const location = parts[2] || '';
    const start_date = (text.match(/\bstart\s+(\d{4}-\d{2}-\d{2})/i)?.[1]) || '';
    const end_date = (text.match(/\bend\s+(\d{4}-\d{2}-\d{2})/i)?.[1]) || '';
    const is_current = /current\s+(true|yes)/i.test(text);
    const description = (text.match(/\bDescription:\s*([\s\S]+)/i)?.[1] || '').trim();
    return [{ action: 'createExperience', params: { userId, job_title, company_name, location, start_date, end_date: is_current ? null : (end_date || ''), is_current, description } }];
  }
  if (/^\s*add\s+education:/i.test(text)) {
    const head = (text.match(/add\s+education:\s*([^\.]+)/i)?.[1] || '').trim();
    const school_name = head.split(',')[0]?.trim() || 'School';
    const degree = (text.match(/\bdegree\s+([^,\.]+)/i)?.[1] || '').trim();
    const field_of_study = (text.match(/\bfield\s+([^,\.]+)/i)?.[1] || '').trim();
    const start_date = (text.match(/\bstart\s+(\d{4}-\d{2}-\d{2})/i)?.[1]) || '';
    const end_date = (text.match(/\bend\s+(\d{4}-\d{2}-\d{2})/i)?.[1]) || '';
    const is_current = /current\s+(true|yes)/i.test(text);
    const description = (text.match(/\bDescription:\s*([\s\S]+)/i)?.[1] || '').trim();
    return [{ action: 'createEducation', params: { userId, school_name, degree, field_of_study, start_date, end_date, is_current, description } }];
  }
  if (/^\s*update\s+my\s+profile:/i.test(text)) {
    const fields = {};
    String(text).replace(/update\s+my\s+profile:\s*([\s\S]+)/i, (_, body) => {
      body.split(',').forEach(pair => {
        const [k, ...rest] = pair.split('=');
        if (!k || !rest.length) return;
        fields[k.trim()] = rest.join('=').trim();
      });
    });
    return [{ action: 'updateUserProfile', params: { userId, ...fields } }];
  }
  if (/^\s*delete\s+project/i.test(text)) {
    const id = String(text).match(/id\s+(\d+)/i)?.[1] || String(text).match(/\bproject\s+(\d+)\b/i)?.[1] || '';
    return [{ action: 'deleteProject', params: { userId, id } }];
  }

  // default → createProject
  const { github_url, live_url, thumbnail_url, video_url } = parseUrls(text);
  const mQuoted = text.match(/"([^"]+)"/);
  let project_name = mQuoted ? mQuoted[1].trim() : 'New Project';
  if (!mQuoted) {
    const nm = text.split('(')[0].split('Also')[0]
      .replace(/^add( a| an)? project:?/i, '')
      .replace(/^create( a| an)? project:?/i, '')
      .trim();
    if (nm) project_name = nm;
  }
  const tech_stack = parseTechStackHeuristic(text);
  const short_description = firstSentence(text);
  const long_description = text;
if(priority == null){
        priority = 0;
    }
  return [{
    action: 'createProject',

    params: { userId, project_name, tech_stack, short_description, long_description, github_url, live_url, thumbnail_url, video_url, priority }
  }];
}

/* -------- Public API -------- */
export async function aiPlan(userId, jobRequest) {
  const userMessage = jobRequest?.jobType || jobRequest?.message || '';

  // 1) Try Gemini (with retries inside callGemini)
  try {
    const prompt = buildPrompt(userMessage);
    const raw = await callGemini(prompt, { model: 'gemini-1.5-flash', maxRetries: 4 });
    const cleaned = stripFences(raw);
    let plan = extractJSONArray(cleaned);

    // Normalize + guardrails + force userId
    plan = plan
      .filter(s => s && SUPPORTED.has(s.action))
      .map(s => {
        const p = { ...(s.params || {}) };
        if (s.action === 'createProject' && p.tech_stack != null) p.tech_stack = coerceTechStack(p.tech_stack);
        return { action: s.action, params: { ...p, userId } };
      });

    if (!plan.length) throw new Error('Empty or unsupported plan from model');
    return { plan, source: 'gemini' };
  } catch (e) {
    // 2) Fallback: local, deterministic plan
    const plan = derivePlanFromText(userId, userMessage);
    return { plan, source: 'fallback' };
  }
}

export default aiPlan;
