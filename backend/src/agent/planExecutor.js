// src/agents/planExecutor.js
import actions from '../tools/stepHandlers.js';

export async function executePlan(plan, context = {}) {
  console.log('executePlan called with plan:', plan);
  const results = [];

  if (!Array.isArray(plan)) return [{ error: 'Plan must be an array of steps.' }];

  for (const step of plan) {
    const action = step?.action;
    const params = step?.params ?? {};

    console.log('▶️ Step action:', action);
    const fn = actions[action];

    if (!fn) {
      const error = `Unknown action: ${action}`;
      console.warn(error);
      results.push({ step, error });
      continue;
    }

    try {
      const merged = { ...params, context };
      const result = await fn(merged);
      console.log('✅ Step completed:', result);
      context.lastResult = result?.result ?? result;
      results.push({ step, result });
    } catch (err) {
      const message = err?.message || 'Action failed.'; // show real reason in dev
      console.error(`❌ Error executing "${action}":`, message);
      results.push({ step, error: message });
    }
  }

  return results;
}

export default executePlan;
