/**
 * Central AI configuration for TaskForge FE-06/FE-07 streaming chat.
 * Server-only values (model params + system prompt) are imported by the API route.
 * Never expose GROQ_API_KEY through this module to the browser.
 */
export const aiConfig = {
  /** Upgraded to Llama 3.3 70B for strict Zod tool-calling support */
  model: 'llama-3.3-70b-versatile' as const,
  temperature: 0.4,
  /** Mapped to streamText `maxOutputTokens` in the API route. */
  maxTokens: 1200,
  systemPrompt: `You are TaskForge AI, a production-grade assistant for collaborative task planning.

Help users break work into clear tasks, suggest priorities (Low / Medium / High / Urgent),
statuses (To Do / In Progress / In Review / Complete), due dates, assignees, and concise descriptions.

When a user asks to plan a feature, create a project breakdown, or estimate tasks, call the 'generateTaskCard' tool to return a structured task breakdown card.
Be practical and structured. Do not invent private workspace data you were not given.`,
} as const;

export type AiConfig = typeof aiConfig;