import { groq } from '@ai-sdk/groq';
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai';
import { aiConfig } from '../../../lib/ai-config';

/**
 * Next.js-style App Router chat handler (FE-06).
 * In TaskForge (Vite), this module is mounted by the Vite AI chat middleware
 * so GROQ_API_KEY stays server-side and never ships to the browser bundle.
 */
export const maxDuration = 30;

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      {
        error:
          'GROQ_API_KEY is missing. Add it to frontend/.env (server-only, no VITE_ prefix).',
      },
      { status: 500 },
    );
  }

  const body = await req.json();
  const messages = (body?.messages ?? []) as UIMessage[];

  const result = streamText({
    model: groq(aiConfig.model),
    system: aiConfig.systemPrompt,
    messages: await convertToModelMessages(messages),
    temperature: aiConfig.temperature,
    maxOutputTokens: aiConfig.maxTokens,
  });

  // SSE UI message data stream consumed by useChat / DefaultChatTransport
  return result.toUIMessageStreamResponse();
}
