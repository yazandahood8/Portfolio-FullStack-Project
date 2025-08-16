// routes/assistantRoutes.js
import { Router } from 'express';
import { aiPlan } from '../agent/aiPlan.js';
import { executePlan } from '../agent/planExecutor.js';

const r = Router();

// Preview only (no execution)
r.post('/assistant/plan', async (req, res) => {
  const { userId, message } = req.body || {};
  try {
    const { plan } = await aiPlan(userId, { jobType: message });
    return res.json({ plan });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Plan failed' });
  }
});

// ✅ Execute the given plan (no LLM call here)
r.post('/assistant/execute', async (req, res) => {
  const { userId, plan } = req.body || {};
  if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });
  if (!Array.isArray(plan) || !plan.length) {
    return res.status(400).json({ success: false, error: 'Missing plan' });
  }

  // Ensure userId on every step
  const normalized = plan.map(s => ({ action: s.action, params: { ...(s.params || {}), userId } }));
  try {
    const results = await executePlan(normalized, { history: [] });
    return res.json({ success: true, results });
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || 'Execute failed' });
  }
});

export default r;
