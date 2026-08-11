// ─────────────────────────────────────────────
// OpenCode Zen reasoning bridge
//
// Reasoning models on OpenCode Zen (e.g. mimo-v2.5-free) stream their thinking
// in a SEPARATE `delta.reasoning` field. The @ai-sdk/openai provider ignores
// that field entirely, so the model's thoughts would be dropped.
//
// This fetch wrapper rewrites the SSE stream on the fly, folding `delta.reasoning`
// into the normal `delta.content` wrapped in <think>…</think>. Downstream we pair
// it with `extractReasoningMiddleware({ tagName: "think" })`, which pulls that
// block back out into proper reasoning parts — so the UI can show the thinking
// live while it streams, and the final answer streams right after.
// ─────────────────────────────────────────────

interface StreamChunk {
  choices?: Array<{
    finish_reason?: string | null;
    delta?: {
      content?: string | null;
      reasoning?: string | null;
      reasoning_details?: unknown;
      tool_calls?: unknown[];
    };
  }>;
}

export const reasoningFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, init);
  const contentType = res.headers.get("content-type") ?? "";
  if (!res.body || !contentType.includes("text/event-stream")) return res;

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let inThink = false;

  // Rewrite a single SSE line. Non-`data:` lines (comments, blanks) pass through.
  const transformLine = (line: string): string => {
    if (!line.startsWith("data:")) return line;
    const payload = line.slice(5).trim();
    if (payload === "" || payload === "[DONE]") return line;

    let json: StreamChunk;
    try {
      json = JSON.parse(payload) as StreamChunk;
    } catch {
      return line;
    }
    const choice = json.choices?.[0];
    const delta = choice?.delta;
    if (!delta) return line;

    const reasoning = typeof delta.reasoning === "string" ? delta.reasoning : "";
    const content = typeof delta.content === "string" ? delta.content : "";
    const hasToolCalls =
      Array.isArray(delta.tool_calls) && delta.tool_calls.length > 0;
    const finished = choice?.finish_reason != null;

    let merged = "";
    if (reasoning) {
      if (!inThink) {
        merged += "<think>";
        inThink = true;
      }
      merged += reasoning;
    }
    // Close the think block as soon as real output (text / tool call / finish)
    // begins, so reasoning never swallows the answer or a tool call.
    if (content || hasToolCalls || finished) {
      if (inThink) {
        merged += "</think>";
        inThink = false;
      }
      merged += content;
    }

    if (merged) delta.content = merged;
    delete delta.reasoning;
    delete delta.reasoning_details;
    return `data: ${JSON.stringify(json)}`;
  };

  // A TransformStream forwards each chunk as it arrives (proper backpressure),
  // so the rewritten SSE streams with the same low latency as the upstream.
  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      // Only process whole lines; keep any trailing partial line buffered so we
      // never parse half a JSON payload.
      const cut = buffer.lastIndexOf("\n");
      if (cut === -1) return;
      const ready = buffer.slice(0, cut + 1);
      buffer = buffer.slice(cut + 1);
      const out = ready
        .split("\n")
        .map((l) => (l === "" ? "" : transformLine(l)))
        .join("\n");
      if (out) controller.enqueue(encoder.encode(out));
    },
    flush(controller) {
      if (buffer) controller.enqueue(encoder.encode(buffer));
    },
  });

  // Strip encoding/length headers — the body is now re-encoded and re-sized.
  const headers = new Headers(res.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");

  return new Response(res.body.pipeThrough(transform), {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
};
