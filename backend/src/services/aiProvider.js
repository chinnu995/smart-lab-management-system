require('dotenv').config();
const axios = require('axios');

// Gemini endpoint – use gemini-3.5-flash for max speed and high rate limits
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';

/**
 * Calls Google Gemini to generate 10 multiple‑choice questions.
 * @param {string} prompt - The prompt describing the subject and format.
 * @returns {Promise<Array>} - Resolves to an array of question objects:
 *   [{ question: string, options: { a:string, b:string, c:string, d:string }, answer: 'a'|'b'|'c'|'d' }]
 */
async function generateTestQuestions(prompt) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_API_KEY not configured in .env');
  }

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  };

  const url = `${GEMINI_ENDPOINT}?key=${apiKey}`;

  // Retry logic: up to 3 attempts with exponential backoff
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.post(url, requestBody, { timeout: 30000 });

      // Expected shape: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Unexpected Gemini response format — no text in response');
      }

      // Parse JSON — Gemini should return clean JSON thanks to responseMimeType
      try {
        const parsed = JSON.parse(text.trim());
        // Handle if Gemini wraps in an object instead of array
        if (Array.isArray(parsed)) return parsed;
        if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;
        throw new Error('Response is not an array of questions');
      } catch (parseErr) {
        // Fallback: extract JSON array from the text
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
          return JSON.parse(text.substring(start, end + 1));
        }
        throw new Error('Failed to parse Gemini question JSON: ' + parseErr.message);
      }
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      const errData = err.response?.data?.error;

      console.error(`Gemini API attempt ${attempt}/3 failed:`, {
        status,
        message: errData?.message || err.message,
      });

      // Only retry on rate limit (429) or server errors (5xx)
      if (status === 429 || (status >= 500 && status < 600)) {
        const delay = attempt * 2000; // 2s, 4s, 6s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      // For other errors (400, 401, 403, etc.) don't retry
      const friendlyMsg = errData?.message || err.message;
      throw new Error(`Gemini API error (${status}): ${friendlyMsg}`);
    }
  }
  throw new Error(`Gemini API failed after 3 retries: ${lastError?.response?.data?.error?.message || lastError?.message}`);
}

async function generateChatbotResponse(systemPrompt, userQuery) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_API_KEY not configured in .env');
  }

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemPrompt}\n\nUser Question: ${userQuery}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  const url = `${GEMINI_ENDPOINT}?key=${apiKey}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.post(url, requestBody, { timeout: 30000 });
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Unexpected response structure');
      }
      return text.trim();
    } catch (err) {
      if (attempt === 3) throw err;
      const delay = attempt * 2000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

module.exports = { generateTestQuestions, generateChatbotResponse };
