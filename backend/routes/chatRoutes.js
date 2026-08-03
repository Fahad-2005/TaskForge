/**
 * TaskForge AI chat — Groq streaming (moved here so production works on Render/Railway).
 * Local Vite middleware can still exist, but the app now calls this Express route.
 */
const express = require('express');

const SYSTEM_PROMPT = `You are TaskForge AI, a production-grade assistant for collaborative task planning.

Help users break work into clear tasks, suggest priorities (Low / Medium / High / Urgent),
statuses (To Do / In Progress / In Review / Complete), due dates, assignees, and concise descriptions.

Be practical and structured. Prefer short bullet lists and ready-to-paste task titles.
When useful, ask one clarifying question. Do not invent private workspace data you were not given.`;

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'GROQ_API_KEY is missing on the server. Add it to backend/.env',
      });
    }

    const { streamText, convertToModelMessages } = await import('ai');
    const { groq } = await import('@ai-sdk/groq');

    const messages = req.body?.messages || [];

    const result = streamText({
      model: groq(process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      temperature: 0.4,
      maxOutputTokens: 1200,
    });

    result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    console.error('[chat]', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error.message || 'Chat request failed',
      });
    }
  }
});

module.exports = router;
