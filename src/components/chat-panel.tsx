"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { useChatStore } from "@/components/chat-provider";
import { GradientSpinner } from "@/components/gradient-spinner";
import { dispatchChatToolResult } from "@/lib/chat-tools";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kauadevbr:chat-messages";

// Desktop-only resize limits (px).
const MIN_W = 340;
const MAX_W = 640;
const DEFAULT_W = 400;
const RESIZE_WIDTH_KEY = "kauadevbr:chat-width";

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const ok = parsed.every(
      (m: unknown) =>
        m &&
        typeof m === "object" &&
        "id" in m &&
        "role" in m &&
        "parts" in m,
    );
    return ok ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function persistMessages(messages: UIMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // quota / unavailable — silent fail
  }
}

function messageText(message: UIMessage): string {
  let out = "";
  const toolNamesSeen = new Set<string>();
  for (const part of message.parts) {
    if (part.type === "text") {
      out += part.text;
    } else if (
      (part.type === "tool-invocation" ||
        part.type.startsWith("tool-")) &&
      typeof (part as { toolInvocation?: { toolName?: string } })
        .toolInvocation === "object"
    ) {
      const partAny = part as unknown as {
        toolInvocation?: { toolName: string; state: string };
      };
      if (partAny.toolInvocation) {
        toolNamesSeen.add(partAny.toolInvocation.toolName);
        if (partAny.toolInvocation.state === "result") {
          dispatchChatToolResult(
            partAny.toolInvocation.toolName,
            undefined,
          );
        }
      }
    }
  }
  return out;
}

export function ChatPanel() {
  const t = useTranslations("chat");
  const { open, setOpen } = useChatStore();

  // Desktop width (persisted). Mobile always uses full width.
  const [width, setWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_W;
    const stored = Number(localStorage.getItem(RESIZE_WIDTH_KEY));
    return Number.isFinite(stored) && stored >= MIN_W && stored <= MAX_W
      ? stored
      : DEFAULT_W;
  });

  const isDesktop = typeof window !== "undefined"
    && window.matchMedia("(min-width: 768px)").matches;

  const chat = useChat<UIMessage>({
    id: "kaua-assistant",
    messages: useMemo(() => loadMessages(), []),
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: ({ messages }) => persistMessages(messages as UIMessage[]),
  });

  // Expose width setter so tools (set_chat_width) can resize the panel.
  useEffect(() => {
    (window as unknown as { __chatSetWidth?: (w: number) => void }).__chatSetWidth = (w: number) => {
      const clamped = Math.max(MIN_W, Math.min(MAX_W, Math.round(w)));
      setWidth(clamped);
      try {
        localStorage.setItem(RESIZE_WIDTH_KEY, String(clamped));
      } catch {
        // ignore
      }
    };
    return () => {
      delete (window as unknown as { __chatSetWidth?: (w: number) => void })
        .__chatSetWidth;
    };
  }, []);

  const { messages, status, sendMessage, setMessages, stop } = chat;
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Dispatch tool results as they arrive in the message stream.
  useEffect(() => {
    for (const m of messages) {
      for (const part of m.parts) {
        if (part.type === "tool-invocation") {
          const inv = (
            part as unknown as {
              toolInvocation?: {
                toolName: string;
                state: string;
                input?: unknown;
              };
            }
          ).toolInvocation;
          if (inv && inv.state === "result") {
            dispatchChatToolResult(inv.toolName, inv.input);
          }
        }
      }
    }
  }, [messages]);

  const isBusy = status === "submitted" || status === "streaming";
  const showIntro = messages.length === 0;
  const lastIsAssistantStreaming =
    isBusy &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    !messages[messages.length - 1].parts.some(
      (p) => (p as { type: string }).type === "tool-invocation",
    ) &&
    messages[messages.length - 1].parts
      .filter((p) => (p as { type: string }).type === "text")
      .map((p) => (p as { text?: string }).text ?? "")
      .join("").length === 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, lastIsAssistantStreaming]);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Push body content right on desktop when panel is open so content doesn't
  // get hidden behind the overlay (and avoid the mobile keyboard issue).
  // On mobile, we use a full-screen slide-up panel instead of a side drawer.

  const handleReset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setMessages([]);
  }, [setMessages]);

  const handleSubmit = useCallback(
    (e?: KeyboardEvent<HTMLTextAreaElement>) => {
      const text = input.trim();
      if (!text || isBusy) return;
      if (e) {
        if (e.shiftKey) return;
        e.preventDefault();
      }
      sendMessage({ text });
      setInput("");
    },
    [input, isBusy, sendMessage],
  );

  // Resize drag handler (desktop).
  const resizeStartRef = useRef<{ startX: number; startW: number } | null>(null);

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    resizeStartRef.current = { startX, startW };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: PointerEvent) => {
      const s = resizeStartRef.current;
      if (!s) return;
      const delta = s.startX - ev.clientX;
      const next = Math.max(MIN_W, Math.min(MAX_W, s.startW + delta));
      setWidth(next);
    };
    const onUp = () => {
      if (resizeStartRef.current) {
        try {
          localStorage.setItem(
            RESIZE_WIDTH_KEY,
            String(
              Math.max(MIN_W, Math.min(MAX_W, resizeStartRef.current.startW)),
            ),
          );
        } catch {
          // ignore
        }
      }
      resizeStartRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      // Save final width.
      try {
        localStorage.setItem(RESIZE_WIDTH_KEY, String(width));
      } catch {
        // ignore
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [width]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* Overlay — desktop: dim background; mobile: full-screen panel. */}
          {isDesktop ? (
            <motion.div
              className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
          ) : null}

          <motion.aside
            className={cn(
              "fixed z-50 flex flex-col border-border bg-background shadow-2xl sm:border-l",
              // Mobile: full-screen slide-up; desktop: right drawer.
              isDesktop
                ? "right-0 top-0 h-dvh border-l"
                : "inset-0 h-dvh w-full border-t",
            )}
            style={
              isDesktop ? { width } : undefined
            }
            initial={isDesktop ? { x: "100%" } : { y: "100%" }}
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            exit={isDesktop ? { x: "100%" } : { y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label={t("panelLabel")}
          >
            {/* Resize handle — desktop only, left edge. */}
            {isDesktop ? (
              <div
                onPointerDown={handleResizeStart}
                className="absolute left-0 top-0 z-10 h-full w-1.5 cursor-col-resize touch-none bg-border/30 transition-colors hover:bg-primary/40"
                aria-hidden
                title="Arraste para redimensionar"
              />
            ) : null}

            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="flex size-7 items-center justify-center overflow-hidden rounded-full border border-border/60"
                  aria-hidden
                >
                  <Image
                    src={siteConfig.github.avatar}
                    alt=""
                    width={28}
                    height={28}
                    className="size-full object-cover"
                    unoptimized
                  />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-medium text-foreground">
                    {t("title")}
                  </p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {t("subtitle")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 rounded-md border border-border/50 px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                  title={t("resetTitle")}
                >
                  {t("resetContext")}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={t("close")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </header>

            {/* Message list — this is the scrollable area; the footer is fixed
                below it so the keyboard only pushes the footer, not the intro. */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4"
              style={{ overscrollBehavior: "contain" }}
            >
              <div className="space-y-3">
                <ChatIntro
                  visible={showIntro}
                  heading={t("introHeading")}
                  body={t("introBody")}
                  chips={t.raw("suggestions") as string[]}
                  onPick={(s) => {
                    if (isBusy) return;
                    sendMessage({ text: s });
                  }}
                />
                {messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    status={status}
                  />
                ))}
              </div>
            </div>

            <footer className="shrink-0 border-t border-border/60 px-4 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit(e);
                  }}
                  rows={1}
                  placeholder={t("placeholder")}
                  className="min-h-[38px] max-h-32 flex-1 resize-none rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-border focus:bg-background"
                  aria-label={t("inputLabel")}
                  disabled={isBusy}
                />
                {isBusy ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="flex h-[38px] items-center gap-1.5 rounded-lg border border-border/60 px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={t("stop")}
                  >
                    <span className="size-2.5 rounded-[2px] bg-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={!input.trim()}
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
                    aria-label={t("send")}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12 14 0M13 6l6 6-6 6" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground/60">
                {t("disclaimer")}
              </p>
            </footer>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function ChatIntro({
  visible,
  heading,
  body,
  chips,
  onPick,
}: {
  visible: boolean;
  heading: string;
  body: string;
  chips: string[];
  onPick: (s: string) => void;
}) {
  if (!visible) return null;
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
        <p className="text-sm font-medium text-foreground">{heading}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-full border border-border/50 px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  status,
}: {
  message: UIMessage;
  status: ReturnType<typeof useChat<UIMessage>>["status"];
}) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const text = messageText(message);

  // Detect tool invocations awaiting/done
  const toolParts = message.parts.filter(
    (p) => (p as { type: string }).type === "tool-invocation",
  );

  const showThinking =
    isAssistant &&
    text.length === 0 &&
    toolParts.length === 0 &&
    (status === "submitted" || status === "streaming");

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm border border-border/50 bg-muted/40 text-foreground",
        )}
      >
        {showThinking ? (
          <span className="flex items-center gap-2 py-0.5 text-muted-foreground">
            <GradientSpinner
              cellSize={3}
              cellGap={1.5}
              rows={2}
              cols={2}
              period={650}
              label="Pensando…"
            />
            <span className="font-mono text-[11px]">…</span>
          </span>
        ) : null}

        {/* Tool status indicators — visible while tool is running. */}
        {toolParts.length > 0 && (
          <div className="mb-1 space-y-0.5">
            {toolParts.map((part, i) => {
              const inv = (
                part as unknown as {
                  toolInvocation?: {
                    toolName: string;
                    state: string;
                  };
                }
              ).toolInvocation;
              if (!inv) return null;
              return (
                <div
                  key={inv.toolName + i}
                  className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/70"
                >
                  {inv.state === "input-streaming" ||
                  inv.state === "input-available" ||
                  inv.state === "pending" ? (
                    <GradientSpinner
                      rows={2}
                      cols={2}
                      cellSize={2}
                      cellGap={1}
                      period={500}
                      label="Tool executando"
                    />
                  ) : null}
                  <span className="uppercase tracking-wider">
                    ⚙ {inv.toolName.replace(/_/g, " ")}
                  </span>
                  {inv.state === "result" ? " ✓" : "…"}
                </div>
              );
            })}
          </div>
        )}

        {/* Markdown content — rendered for assistant messages; plain text for
            the user bubble to avoid complexity. */}
        {text ? (
          isAssistant ? (
            <div className="chat-markdown break-words">
              <ReactMarkdown
                components={{
                  a: ({ ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
                    />
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className?.includes("language-");
                    if (isInline) {
                      return (
                        <code
                          {...props}
                          className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.85em]"
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code
                        {...props}
                        className="my-1 block overflow-x-auto rounded bg-foreground/10 px-2 py-1 font-mono text-[0.85em]"
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ ...props }) => (
                    <pre {...props} className="my-1 overflow-x-auto" />
                  ),
                  ul: ({ ...props }) => (
                    <ul
                      {...props}
                      className="ml-4 list-disc space-y-0.5"
                    />
                  ),
                  ol: ({ ...props }) => (
                    <ol
                      {...props}
                      className="ml-4 list-decimal space-y-0.5"
                    />
                  ),
                  p: ({ ...props }) => (
                    <p {...props} className="mb-1 last:mb-0" />
                  ),
                  h1: ({ ...props }) => (
                    <h1
                      {...props}
                      className="mb-1 text-base font-semibold last:mb-0"
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h2
                      {...props}
                      className="mb-1 text-base font-semibold last:mb-0"
                    />
                  ),
                  h3: ({ ...props }) => (
                    <h3
                      {...props}
                      className="mb-0.5 text-sm font-semibold last:mb-0"
                    />
                  ),
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{text}</p>
          )
        ) : null}
      </div>
    </div>
  );
}