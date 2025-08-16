// src/agent/aiAgent.js
import { getModelContext, updateModelContext } from '../MCP/modelContext.js';
import { callGemini } from '../tools/geminiTool.js';
import { executePlan } from './planExecutor.js';

const SUPPORTED = new Set([
  'createProject',
  'deleteProject',
  'createSkill',
  'createExperience',
  'createEducation',
  'updateUserProfile'
]);

function stripFences(s) {
  return String(s).replace(/```json/gi, '').replace(/```/g, '').trim();
}

function extractJSONArray(s) {
  try { return JSON.parse(s); } catch {}
  const start = s.indexOf('['), end = s.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    const sub = s.slice(start, end + 1);
    try { return JSON.parse(sub); } catch {}
  }
  const os = s.indexOf('{'), oe = s.lastIndexOf('}');
  if (os !== -1 && oe !== -1 && oe > os) {
    const objStr = s.slice(os, oe + 1);
    try { return [JSON.parse(objStr)]; } catch {}
  }
  throw new Error('Invalid JSON returned by model.');
}

function coerceTechStack(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

/** Very small rule-based fallback to keep the system working if Gemini is down */
function derivePlanFromText(userId, textRaw) {
  const text = String(textRaw || '');
  const urls = Array.from(text.matchAll(/https?:\/\/\S+/g)).map(m => m[0]);

  const github_url = urls.find(u => /github\.com/i.test(u)) || '';
  const video_url =
    urls.find(u => /(youtube\.com|youtu\.be|linkedin\.com\/feed\/update)/i.test(u)) || '';
  const live_url =
    urls.find(u => /(vercel\.app|netlify\.app|render\.com|onrender\.com|fly\.io)/i.test(u)) || '';
  const thumbnail_url =
    urls.find(u => /(uploads|\.png|\.jpg|\.jpeg)$/i.test(u)) || '';

  // Try to infer project name
  let project_name = 'New Project';
  const nameMatch =
    text.match(/Rock[-\s]?Paper[-\s]?Scissors/gi)?.[0] ||
    text.match(/AI Resume Generator|Resume\s+Generator/i)?.[0];
  if (nameMatch) project_name = nameMatch.replace(/\s+/g, ' ').trim();
  if (/game/i.test(text) && !/Rock[-\s]?Paper[-\s]?Scissors/i.test(project_name)) {
    project_name = `${project_name} Game`.trim();
  }

  // Extract tech stack keywords
  const KNOWN_TECH = [
    'Python','OpenCV','MediaPipe','TensorFlow','PyTorch',
    'Flask','FastAPI','Django','Node.js','React','Angular'
  ];
  const tech_stack = KNOWN_TECH.filter(t =>
    new RegExp(`\\b${t.replace('.', '\\.')}\\b`, 'i').test(text)
  );
  if (tech_stack.length === 0) tech_stack.push('Python');

  // Short & long descriptions
  const firstSentence = (text.split(/(?<=\.)\s+/)[0] || text).trim();
  const short_description = firstSentence.slice(0, 200);
  const long_description = text.trim();

  return [
    {
      action: 'createProject',
      params: {
        userId,
        project_name,
        tech_stack,
        short_description,
        long_description,
        github_url,
        live_url,
        thumbnail_url,
        video_url,
        priority: 0
      }
    }
  ];
}

export async function aiAgent(userId, jobRequest) {
  const context = getModelContext(userId);
  const userUtterance = jobRequest?.jobType ?? '';

  const prompt = `
You are an API-oriented backend assistant for an automated portfolio builder.
Return ONLY a valid, minimal JSON array of action objects — no Markdown, no prose.

Each item:
- "action": one of ["createProject","deleteProject","createSkill","createExperience","createEducation","updateUserProfile"]
- "params": object

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

If a field is not provided by the user, omit it or set empty string.

User says: "${userUtterance}"

Return only the array.`;

  let plan;
  try {
    const raw = await callGemini(prompt, { model: 'gemini-1.5-flash', maxRetries: 4 });
    const cleaned = stripFences(raw);
    let parsed = extractJSONArray(cleaned);

    // normalize, filter, and OVERRIDE userId with trusted UUID
    parsed = parsed
      .filter(s => s && SUPPORTED.has(s.action))
      .map(s => {
        const p = { ...(s.params || {}) };
        if (s.action === 'createProject' && p.tech_stack != null) {
          p.tech_stack = coerceTechStack(p.tech_stack);
        }
        return { action: s.action, params: { ...p, userId } };
      });

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Empty or unsupported plan from model.');
    }
    plan = parsed;
  } catch (e) {
    console.warn('⚠️ Falling back to local rule-based plan due to Gemini failure:', e?.message || e);
    plan = derivePlanFromText(userId, userUtterance);
  }

  const results = await executePlan(plan, context);
  updateModelContext(userId, { lastPlan: plan, lastResult: results.at(-1)?.result });
  return { success: true, results };
}

export default aiAgent;
