import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// For convenience: get the Gemini 1.5 Flash model instance
export const geminiFlash = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export default genAI;
