import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  CHAT_MODEL_ID,
  OPENROUTER_BASE_URL,
  buildAgentSystemPrompt,
} from "@/lib/agent-context";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const openrouter = createOpenAI({
  baseURL: OPENROUTER_BASE_URL,
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://kaua.dev.br",
    "X-Title": "kaua.dev.br assistant",
  },
});

export async function POST(req: Request) {
  const apiKey = process.env.OPEN_ROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPEN_ROUTER_API_KEY is not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: { messages: UIMessage[] };
  try {
    body = (await req.json()) as { messages: UIMessage[] };
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = await convertToModelMessages(body.messages);

  const result = streamText({
    model: openrouter(CHAT_MODEL_ID),
    system: buildAgentSystemPrompt(),
    messages,
    temperature: 0.7,
    maxRetries: 2,
  });

  return result.toUIMessageStreamResponse();
}