/**
 * TaskForge AI chat — Groq streaming for useChat (AI SDK UI message stream).
 */
const express = require('express');

const SYSTEM_PROMPT = `You are TaskForge AI, a production-grade assistant for collaborative task planning.

Help users break work into clear tasks, suggest priorities (Low / Medium / High / Urgent),
statuses (To Do / In Progress / In Review / Complete), due dates, assignees, and concise descriptions.

Be practical and structured. Prefer short bullet lists and ready-to-paste task titles.
When useful, ask one clarifying question. Do not invent private workspace data you were not given.`;

function errorHandler(error) {
  console.error('[chat] stream error:', error);
  if (error == null) return 'unknown error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

function toModelMessages(uiMessages = []) {
  return uiMessages
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .map((message) => {
      const text = Array.isArray(message.parts)
        ? message.parts
            .filter((part) => part?.type === 'text' && typeof part.text === 'string')
            .map((part) => part.text)
            .join('')
        : typeof message.content === 'string'
          ? message.content
          : '';

      return {
        role: message.role,
        content: text || ' ',
      };
    })
    .filter((message) => message.content.trim().length > 0);
}

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'GROQ_API_KEY is missing on the server. Add it in Render Environment.',
      });
    }

    const {
      streamText,
      pipeUIMessageStreamToResponse,
      toUIMessageStream,
    } = await import('ai');
    const { groq } = await import('@ai-sdk/groq');

    const modelId = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    const messages = toModelMessages(req.body?.messages || []);

    if (messages.length === 0) {
      return res.status(400).json({ error: 'No valid chat messages provided.' });
    }

    const result = streamText({
      model: groq(modelId),
      system: SYSTEM_PROMPT,
      messages,
      temperature: 0.4,
      maxOutputTokens: 1200,
    });

    await pipeUIMessageStreamToResponse({
      response: res,
      stream: toUIMessageStream({
        stream: result.stream,
        onError: errorHandler,
      }),
      headers: {
        'X-Accel-Buffering': 'no',
        'Cache-Control': 'no-cache, no-transform',
        'Content-Encoding': 'none',
      },
    });
  } catch (error) {
    console.error('[chat]', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: errorHandler(error),
      });
    }
  }
});

module.exports = router;
