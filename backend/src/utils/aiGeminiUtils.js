import { geminiFlash } from '../ai/gemini.js';

/**
 * Generate content using Gemini 1.5 Flash
 * @param {string} prompt
 * @returns {Promise<string>} response from Gemini
 */
export async function generateGeminiContent(prompt) {
  const result = await geminiFlash.generateContent(prompt);
  // The SDK might return .response or .text
  if (typeof result === 'string') return result;
  return result.response ?? result.text ?? '';
}
