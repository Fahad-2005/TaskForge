import { groq } from '@ai-sdk/groq';
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai';
import { z } from 'zod';
import { aiConfig } from '../../../lib/ai-config';

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
    tools: {
      generateTaskCard: {
        description:
          'Generates a structured task breakdown card for project planning and task management.',
        inputSchema: z.object({
          projectTitle: z.string().describe('Title of the feature or epic'),
          priority: z
            .enum(['Low', 'Medium', 'High', 'Urgent'])
            .describe('Overall priority level'),
          totalHours: z.number().describe('Total estimated completion time in hours'),
          subtasks: z.array(
            z.object({
              title: z.string().describe('Actionable subtask name'),
              estimatedHours: z.number().describe('Hours estimated for this subtask'),
              status: z
                .enum(['To Do', 'In Progress', 'In Review', 'Complete'])
                .default('To Do'),
            }),
          ),
        }),
        execute: async (input) => {
          return {
            success: true,
            timestamp: new Date().toISOString(),
            data: input,
          };
        },
      },
    },
  });

  return result.toUIMessageStreamResponse({
    onError: (error) =>
      error instanceof Error ? error.message : 'Chat stream failed',
  });
}