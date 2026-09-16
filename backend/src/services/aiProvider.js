require('dotenv').config();
const axios = require('axios');

// Gemini endpoint – use gemini-3.6-flash for max speed and compatibility
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

/**
 * Calls Google Gemini to generate 10 multiple‑choice questions.
 */
async function generateTestQuestions(prompt) {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
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

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.post(url, requestBody, { timeout: 30000 });
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Unexpected Gemini response format — no text in response');
      }

      try {
        const parsed = JSON.parse(text.trim());
        if (Array.isArray(parsed)) return parsed;
        if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;
        throw new Error('Response is not an array of questions');
      } catch (parseErr) {
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

      if (status === 429 || (status >= 500 && status < 600)) {
        const delay = attempt * 2000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const friendlyMsg = errData?.message || err.message;
      throw new Error(`Gemini API error (${status}): ${friendlyMsg}`);
    }
  }
  throw new Error(`Gemini API failed after 3 retries: ${lastError?.response?.data?.error?.message || lastError?.message}`);
}

async function generateChatbotResponse(systemPrompt, userQuery) {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
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

/**
 * Generates personalized AI feedback & study improvement tips for student MCQ test performance.
 */
async function generateTestFeedback(subject, score, total, incorrectQuestions = []) {
  const percentage = Math.round((score / total) * 100);
  const apiKey = process.env.AI_API_KEY;

  const defaultFeedback = {
    summary: percentage >= 80 
      ? `Outstanding performance in ${subject}! You demonstrated strong mastery of key concepts.` 
      : percentage >= 50 
        ? `Good effort in ${subject}! You passed the assessment, but reviewing missed concepts will sharpen your knowledge.` 
        : `Needs improvement in ${subject}. Focus on building your core understanding before your upcoming exams.`,
    strengths: percentage >= 50 
      ? [`Strong core knowledge in ${subject}`, `Accurate response selection on mastered topics`] 
      : [`Attempted all questions diligently`],
    weaknesses: incorrectQuestions.length > 0 
      ? incorrectQuestions.map(q => q.question).slice(0, 3) 
      : [`No significant conceptual weaknesses detected!`],
    recommendations: percentage >= 80 
      ? [`Challenge yourself with advanced ${subject} practice problems`, `Form a peer study group to teach key topics`, `Review complex edge-case questions`] 
      : percentage >= 50 
        ? [`Carefully inspect the correct answer key below for missed questions`, `Re-read textbook notes on incorrect topics`, `Retake practice quizzes to reinforce learning`] 
        : [`Schedule a 1-on-1 revision session with your faculty`, `Thoroughly re-read lab manuals and course slides`, `Practice 10 extra problem sets per week`]
  };

  if (!apiKey) return defaultFeedback;

  try {
    const prompt = `You are an expert AI academic tutor. Analyze this student's MCQ test performance:
Subject: ${subject}
Score: ${score} out of ${total} (${percentage}%)
Missed Questions: ${JSON.stringify(incorrectQuestions.slice(0, 5))}

Return ONLY a valid JSON object with NO markdown formatting matching this structure:
{
  "summary": "1-2 sentence encouraging performance analysis",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["concept to review 1", "concept to review 2"],
  "recommendations": ["actionable study tip 1", "actionable study tip 2", "actionable study tip 3"]
}`;

    const text = await generateChatbotResponse(prompt, "Provide student performance feedback");
    if (text) {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        summary: parsed.summary || defaultFeedback.summary,
        strengths: parsed.strengths || defaultFeedback.strengths,
        weaknesses: parsed.weaknesses || defaultFeedback.weaknesses,
        recommendations: parsed.recommendations || defaultFeedback.recommendations
      };
    }
  } catch (e) {
    console.warn('AI feedback generation warning:', e.message);
  }

  return defaultFeedback;
}

module.exports = { generateTestQuestions, generateChatbotResponse, generateTestFeedback };
