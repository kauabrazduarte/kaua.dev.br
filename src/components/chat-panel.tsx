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
import {
  DefaultChatTransport,
  isToolUIPart,
  getToolName,
  type UIMessage,
} from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

// Extrai apenas o texto das partes da mensagem (ignora tool parts).
function messageText(message: UIMessage): string {
  let out = "";
  for (const part of message.parts) {
    if (part.type === "text") {
      out += (part as { text: string }).text;
    }
  }
  return out;
}

// Extrai as tool parts de uma mensagem usando os helpers do AI SDK v7.
function messageToolParts(
  message: UIMessage,
): Array<{
  toolName: string;
  state: string;
  input?: unknown;
  part: UIMessage["parts"][number];
}> {
  const parts: Array<{
    toolName: string;
    state: string;
    input?: unknown;
    part: UIMessage["parts"][number];
  }> = [];
  for (const part of message.parts) {
    if (isToolUIPart(part)) {
      const toolName = getToolName(
        part as Parameters<typeof getToolName>[0],
      );
      const p = part as unknown as {
        state: string;
        input?: unknown;
      };
      parts.push({
        toolName,
        state: p.state,
        input: p.input,
        part,
      });
    }
  }
  return parts;
}

// Conjunto de toolCallIds já despachados — evita despachar a mesma
// tool result múltiplas vezes quando o componente re-renderiza.
const dispatchedTools = new Set<string>();

export function ChatPanel() {
  const t = useTranslations("chat");
  const { open, setOpen } = useChatStore();

  const [width, setWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_W;
    const stored = Number(localStorage.getItem(RESIZE_WIDTH_KEY));
    return Number.isFinite(stored) && stored >= MIN_W && stored <= MAX_W
      ? stored
      : DEFAULT_W;
  });

  const isDesktop =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches;

  const chat = useChat<UIMessage>({
    id: "kaua-assistant",
    messages: useMemo(() => loadMessages(), []),
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: ({ messages }) => persistMessages(messages as UIMessage[]),
  });

  useEffect(() => {
    (
      window as unknown as { __chatSetWidth?: (w: number) => void }
    ).__chatSetWidth = (w: number) => {
      const clamped = Math.max(MIN_W, Math.min(MAX_W, Math.round(w)));
      setWidth(clamped);
      try {
        localStorage.setItem(RESIZE_WIDTH_KEY, String(clamped));
      } catch {
        // ignore
      }
    };
    return () => {
      delete (
        window as unknown as { __chatSetWidth?: (w: number) => void }
      ).__chatSetWidth;
    };
  }, []);

  const { messages, status, sendMessage, setMessages, stop } = chat;
  const [input, setInput] = useState("");
  const [showEggs, setShowEggs] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Easter egg: triplo-clique no avatar do header alterna a lista de comandos.
  const avatarClickRef = useRef<{ count: number; last: number }>({
    count: 0,
    last: 0,
  });
  const handleAvatarTripleClick = useCallback(() => {
    const now = Date.now();
    const ref = avatarClickRef.current;
    if (now - ref.last < 500) {
      ref.count++;
    } else {
      ref.count = 1;
    }
    ref.last = now;
    if (ref.count >= 3) {
      ref.count = 0;
      setShowEggs((v) => !v);
    }
  }, []);

  // Despacha as tool results no cliente quando o estado muda para
  // "output-available". Roda como efeito colateral (nunca durante render).
  useEffect(() => {
    for (const m of messages) {
      const tools = messageToolParts(m);
      for (const tool of tools) {
        const partAny = tool.part as unknown as {
          toolCallId: string;
          state: string;
          input?: unknown;
        };
        const dispatchKey = `${m.id}:${partAny.toolCallId}`;
        if (
          tool.state === "output-available" &&
          !dispatchedTools.has(dispatchKey)
        ) {
          dispatchedTools.add(dispatchKey);
          dispatchChatToolResult(tool.toolName, tool.input);
        }
      }
    }
  }, [messages]);

  const isBusy = status === "submitted" || status === "streaming";
  const showIntro = messages.length === 0;

  // Verifica se a última mensagem assistente está "pensando" (sem texto e
  // sem tool parts ainda).
  const lastIsAssistantStreaming = (() => {
    if (!isBusy || messages.length === 0) return false;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return false;
    const tools = messageToolParts(last);
    if (tools.length > 0) return false;
    return messageText(last).length === 0;
  })();

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

  const handleReset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    dispatchedTools.clear();
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

  // Easter egg: !tools ou !help no input abre a lista de comandos ocultos.
  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== "Enter") return;
      const trimmed = input.trim().toLowerCase();
      if (trimmed === "!tools" || trimmed === "!help" || trimmed === "!comandos") {
        e.preventDefault();
        setShowEggs(true);
        setInput("");
        return;
      }
      handleSubmit(e);
    },
    [input, handleSubmit],
  );

  // Resize drag handler (desktop).
  const resizeStartRef = useRef<{ startX: number; startW: number } | null>(
    null,
  );

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
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
        resizeStartRef.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [width],
  );

  // Persiste a largura final no resize.
  useEffect(() => {
    try {
      localStorage.setItem(RESIZE_WIDTH_KEY, String(width));
    } catch {
      // ignore
    }
  }, [width]);

  return (
    <AnimatePresence>
      {open ? (
        <>
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
              "fixed z-50 flex flex-col border-border bg-background shadow-2xl",
              isDesktop
                ? "right-0 top-0 h-dvh border-l"
                : "inset-0 h-dvh w-full border-t",
            )}
            style={isDesktop ? { width } : undefined}
            initial={isDesktop ? { x: "100%" } : { y: "100%" }}
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            exit={isDesktop ? { x: "100%" } : { y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label={t("panelLabel")}
          >
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
                  onClick={handleAvatarTripleClick}
                  className="flex size-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border/60 transition-shadow"
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
                <EasterEggPanel
                  visible={showEggs}
                  title={t("easterEggTitle")}
                  subtitle={t("easterEggSubtitle")}
                  hint={t("easterEggHint")}
                  items={t.raw("easterEggItems") as Array<{ cmd: string; desc: string }>}
                  onClose={() => setShowEggs(false)}
                />
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} status={status} />
                ))}
              </div>
            </div>

            <footer className="shrink-0 border-t border-border/60 px-4 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
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
              <div className="mt-2 flex items-center justify-between">
                <p className="font-mono text-[10px] text-muted-foreground/60">
                  {t("disclaimer")}
                </p>
                <button
                  type="button"
                  onClick={() => setShowEggs((v) => !v)}
                  className="font-mono text-[10px] text-muted-foreground/40 transition-colors hover:text-foreground"
                  title={t("easterEggToggle")}
                  aria-label={t("easterEggToggle")}
                >
                  {showEggs ? "× " : ""}
                  {t("easterEggToggle")}
                </button>
              </div>
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

function EasterEggPanel({
  visible,
  title,
  subtitle,
  hint,
  items,
  onClose,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  hint: string;
  items: Array<{ cmd: string; desc: string }>;
  onClose: () => void;
}) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="overflow-hidden rounded-lg border border-primary/20 bg-primary/5"
    >
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            <span className="mr-1" aria-hidden>✨</span>
            {title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Fechar"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <ul className="max-h-48 space-y-0.5 overflow-y-auto px-3 pb-2 scrollbar-none">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-baseline gap-2 text-xs"
          >
            <span className="shrink-0 font-mono font-medium text-primary/80">
              {item.cmd}
            </span>
            <span className="text-muted-foreground">— {item.desc}</span>
          </li>
        ))}
      </ul>
      <p className="border-t border-primary/10 px-3 py-1.5 font-mono text-[10px] text-muted-foreground/60">
        {hint}
      </p>
    </motion.div>
  );
}

// Label amigável para o nome da tool.
const TOOL_LABELS: Record<string, string> = {
  set_theme: "Alterar tema",
  toggle_theme: "Alternar tema",
  fireworks: "Fogos de artifício",
  confetti_rain: "Chuva de confete",
  rocket_confetti: "Foguetes de confete",
  scroll_to: "Rolar até seção",
  open_link: "Abrir link",
  change_language: "Mudar idioma",
  show_toast: "Mostrar notificação",
  pulse_element: "Pulsar elemento",
  highlight_section: "Destacar seção",
  copy_to_clipboard: "Copiar para área de transferência",
  earthquake: "Terremoto",
  invert_colors: "Inverter cores",
  set_chat_width: "Redimensionar chat",
  trigger_presence: "Simular presença",
  balloon_phrase: "Frase do balão",
  shake_cat: "Sacudir gato",
  hide_balloon: "Esconder balão",
  glow_avatar: "Brilho no avatar",
  jump_to_cat: "Ir até o gato",
};

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
  const toolParts = messageToolParts(message);

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

        {/* Indicadores de execução de ferramentas — visíveis enquanto a tool
            roda e também após completar, mostrando o resultado. */}
        {toolParts.length > 0 && (
          <div className="mb-1.5 space-y-1">
            {toolParts.map((tp, i) => {
              const label =
                TOOL_LABELS[tp.toolName] ??
                tp.toolName.replace(/_/g, " ");
              const isRunning =
                tp.state === "input-streaming" ||
                tp.state === "input-available" ||
                tp.state === "approval-requested" ||
                tp.state === "approval-responded";
              const isDone = tp.state === "output-available";
              const isError = tp.state === "output-error";

              return (
                <div
                  key={`${tp.toolName}-${i}`}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-2 py-1 font-mono text-[10px]",
                    isRunning &&
                      "border-primary/30 bg-primary/5 text-muted-foreground",
                    isDone &&
                      "border-success/30 bg-success/5 text-muted-foreground",
                    isError &&
                      "border-destructive/30 bg-destructive/5 text-destructive",
                  )}
                >
                  {isRunning ? (
                    <GradientSpinner
                      rows={2}
                      cols={2}
                      cellSize={2}
                      cellGap={1}
                      period={500}
                      label="Executando ferramenta"
                    />
                  ) : (
                    <span aria-hidden className="text-[11px]">
                      {isDone ? "✓" : isError ? "✕" : "⚙"}
                    </span>
                  )}
                  <span className="uppercase tracking-wider">{label}</span>
                  <span className="ml-auto text-muted-foreground/60">
                    {isRunning
                      ? "executando…"
                      : isDone
                        ? "concluído"
                        : isError
                          ? "erro"
                          : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Conteúdo Markdown — renderizado para mensagens do assistente;
            texto puro para o usuário. */}
        {text ? (
          isAssistant ? (
            <div className="chat-markdown break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
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
                    <pre
                      {...props}
                      className="my-1 overflow-x-auto text-xs"
                    />
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
                  li: ({ ...props }) => (
                    <li {...props} className="leading-relaxed" />
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
                  table: ({ ...props }) => (
                    <div className="my-2 overflow-x-auto">
                      <table
                        {...props}
                        className="w-full border-collapse text-xs"
                      />
                    </div>
                  ),
                  thead: ({ ...props }) => (
                    <thead
                      {...props}
                      className="border-b border-border/60"
                    />
                  ),
                  th: ({ ...props }) => (
                    <th
                      {...props}
                      className="border border-border/40 px-2 py-1 text-left font-semibold"
                    />
                  ),
                  td: ({ ...props }) => (
                    <td
                      {...props}
                      className="border border-border/40 px-2 py-1"
                    />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote
                      {...props}
                      className="my-1 border-l-2 border-border/60 pl-2 italic text-muted-foreground"
                    />
                  ),
                  hr: ({ ...props }) => (
                    <hr
                      {...props}
                      className="my-2 border-border/40"
                    />
                  ),
                  strong: ({ ...props }) => (
                    <strong {...props} className="font-semibold" />
                  ),
                  em: ({ ...props }) => (
                    <em {...props} className="italic" />
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