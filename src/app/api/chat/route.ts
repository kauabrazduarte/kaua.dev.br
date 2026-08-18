import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  streamText,
  wrapLanguageModel,
  extractReasoningMiddleware,
  isStepCount,
  type UIMessage,
} from "ai";
import {
  CHAT_MODEL_ID,
  OPENCODE_BASE_URL,
  buildAgentSystemPrompt,
} from "@/lib/agent-context";
import { getChatTools } from "@/lib/chat-tools";
import { reasoningFetch } from "@/lib/opencode-reasoning";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

const opencode = createOpenAI({
  baseURL: OPENCODE_BASE_URL,
  apiKey: process.env.OPENCODE_API_KEY,
  // Folds OpenCode Zen's separate `reasoning` field into <think>…</think>.
  fetch: reasoningFetch,
});

// Reasoning models stream their thinking; extract it into proper reasoning
// parts so the UI can show it live.
const chatModel = wrapLanguageModel({
  model: opencode.chat(CHAT_MODEL_ID),
  middleware: extractReasoningMiddleware({ tagName: "think" }),
});

export async function POST(req: Request) {
  const apiKey = process.env.OPENCODE_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPENCODE_API_KEY is not configured." }),
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
    model: chatModel,
    system: buildAgentSystemPrompt(),
    messages,
    tools,
    toolChoice: "auto",
    temperature: 0.7,
    maxRetries: 2,
    stopWhen: isStepCount(6),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    onError: (err) => {
      return err instanceof Error ? err.message : String(err);
    },
  });
}