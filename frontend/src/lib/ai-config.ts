/**
 * Central AI configuration for TaskForge FE-06 streaming chat.
 * Server-only values (model params + system prompt) are imported by the API route.
 * Never expose GROQ_API_KEY through this module to the browser.
 */
export const aiConfig = {
  /** Free-tier Groq model — fast + reliable */
  model: 'llama-3.1-8b-instant' as const,
  temperature: 0.4,
  /** Mapped to streamText `maxOutputTokens` in the API route. */
  maxTokens: 1200,
  systemPrompt: `You are TaskForge AI, a production-grade assistant for collaborative task planning.

Help users break work into clear tasks, suggest priorities (Low / Medium / High / Urgent),
statuses (To Do / In Progress / In Review / Complete), due dates, assignees, and concise descriptions.

Be practical and structured. Prefer short bullet lists and ready-to-paste task titles.
When useful, ask one clarifying question. Do not invent private workspace data you were not given.`,
} as const;

export type AiConfig = typeof aiConfig;
