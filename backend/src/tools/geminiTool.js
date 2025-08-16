// src/tools/geminiTool.js
// Uses native fetch (Node >=18). If on older Node, install node-fetch and import it.

const GEMINI_ENDPOINT = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

/**
 * Calls Gemini with robust retries on transient errors (429/500/502/503/504).
 * @param {string} prompt
 * @param {{ model?: string, maxRetries?: number, initialDelayMs?: number, timeoutMs?: number }} opts
 * @returns {Promise<string>} raw text response from the top candidate
 */
export async function callGemini(
  prompt,
  { model = 'gemini-1.5-flash', maxRetries = 4, initialDelayMs = 800, timeoutMs = 20000 } = {}
) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) throw new Error('Missing GOOGLE_API_KEY env var.');

  const body = {
    contents: [{ role: 'user', parts: [{ text: String(prompt) }]}],
  };

  let attempt = 0;
  let delay = initialDelayMs;

  // Retry loop
  // Retries on: 408, 409, 425, 429, 500, 502, 503, 504
  const RETRY_STATUSES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    try {
      const res = await fetchWithTimeout(
        `${GEMINI_ENDPOINT(model)}?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        },
        timeoutMs
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        const status = res.status;
        const transient = RETRY_STATUSES.has(status);
        const msg = `Gemini HTTP ${status}${errText ? ` — ${errText}` : ''}`;

        if (transient && attempt <= maxRetries) {
          const jitter = Math.floor(Math.random() * 250);
          console.warn(`⚠️ ${msg}. Retry ${attempt}/${maxRetries} in ${delay + jitter}ms`);
          await sleep(delay + jitter);
          delay *= 2;
          continue;
        }
        throw new Error(msg);
      }

      const json = await res.json();
      const text =
        json?.candidates?.[0]?.content?.parts?.[0]?.text ??
        json?.candidates?.[0]?.content?.parts?.map(p => p?.text).filter(Boolean).join('\n');

      if (!text) throw new Error('Gemini returned no text.');
      return String(text);
    } catch (e) {
      // Network/timeout aborts
      const transient = /aborted|timeout|network/i.test(String(e?.message || ''));
      if ((transient || true) && attempt <= maxRetries) {
        const jitter = Math.floor(Math.random() * 250);
        console.warn(`⚠️ Gemini error: ${e?.message || e}. Retry ${attempt}/${maxRetries} in ${delay + jitter}ms`);
        await sleep(delay + jitter);
        delay *= 2;
        continue;
      }
      apiKey = process.env.GOOGLE_API_KEY2;
          try {
      const res = await fetchWithTimeout(
        `${GEMINI_ENDPOINT(model)}?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        },
        timeoutMs
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        const status = res.status;
        const transient = RETRY_STATUSES.has(status);
        const msg = `Gemini HTTP ${status}${errText ? ` — ${errText}` : ''}`;

        if (transient && attempt <= maxRetries) {
          const jitter = Math.floor(Math.random() * 250);
          console.warn(`⚠️ ${msg}. Retry ${attempt}/${maxRetries} in ${delay + jitter}ms`);
          await sleep(delay + jitter);
          delay *= 2;
          continue;
        }
        throw new Error(msg);
      }

      const json = await res.json();
      const text =
        json?.candidates?.[0]?.content?.parts?.[0]?.text ??
        json?.candidates?.[0]?.content?.parts?.map(p => p?.text).filter(Boolean).join('\n');

      if (!text) throw new Error('Gemini returned no text.');
      return String(text);
    } catch (e) {
      console.error('❌ Gemini final failure:', e?.message || e);
      throw new Error('Failed to call Gemini API');
    }
    }
  }
}

export default callGemini;
