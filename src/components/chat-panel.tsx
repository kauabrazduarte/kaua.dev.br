"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChatStore } from "@/components/chat-provider";
import { GradientSpinner } from "@/components/gradient-spinner";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kauadevbr:chat-messages";

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const ok = parsed.every(
      (m: unknown) =>
        m && typeof m === "object" && "id" in m && "role" in m && "parts" in m,
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
  for (const part of message.parts) {
    if (part.type === "text") out += part.text;
  }
  return out;
}

export function ChatPanel() {
  const t = useTranslations("chat");
  const { open, setOpen } = useChatStore();
  const chat = useChat<UIMessage>({
    id: "kaua-assistant",
    messages: useMemo(() => loadMessages(), []),
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: ({ messages }) => persistMessages(messages as UIMessage[]),
  });

  const { messages, status, sendMessage, setMessages, stop } = chat;
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isBusy = status === "submitted" || status === "streaming";
  const showIntro = messages.length === 0;
  const lastIsAssistantStreaming =
    isBusy &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messageText(messages[messages.length - 1]).length === 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, lastIsAssistantStreaming]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  function handleReset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setMessages([]);
  }

  function handleSubmit(e?: KeyboardEvent<HTMLTextAreaElement>) {
    const text = input.trim();
    if (!text || isBusy) return;
    if (e) {
      if (e.shiftKey) return;
      e.preventDefault();
    }
    sendMessage({ text });
    setInput("");
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[400px] flex-col border-l border-border bg-background shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label={t("panelLabel")}
          >
            <header className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
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

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
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
                <MessageBubble key={m.id} message={m} status={status} />
              ))}
            </div>

            <footer className="border-t border-border/60 px-4 py-3">
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
        {isAssistant && text.length === 0 && (
          status === "submitted" || status === "streaming" ? (
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
          ) : null
        )}
        {text ? (
          <p className="whitespace-pre-wrap break-words">{text}</p>
        ) : null}
      </div>
    </div>
  );
}