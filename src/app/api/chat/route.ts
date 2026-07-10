import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, isStepCount, type UIMessage } from "ai";
import {
  CHAT_MODEL_ID,
  OPENROUTER_BASE_URL,
  buildAgentSystemPrompt,
} from "@/lib/agent-context";
import { getChatTools } from "@/lib/chat-tools";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

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
      headers: { "Content-Type": "application/json" } },
    );
  }

  const tools = getChatTools();

  const messages = await convertToModelMessages(body.messages, { tools });

  const result = streamText({
    model: openrouter.chat(CHAT_MODEL_ID),
    system: buildAgentSystemPrompt(),
    messages,
    tools,
    toolChoice: "auto",
    temperature: 0.7,
    maxRetries: 2,
    stopWhen: isStepCount(6),
  });

  return result.toUIMessageStreamResponse({
    onError: (err) => {
      return err instanceof Error ? err.message : String(err);
    },
  });
}