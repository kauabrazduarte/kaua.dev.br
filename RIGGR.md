# Project Memory — kaua.dev.br

## AI Chat (OpenCode Zen + Vercel AI SDK)
- Chat agent: `/api/chat` (route handler) — streams via Vercel AI SDK v7 (`streamText` + `toUIMessageStreamResponse`).
- Provider: OpenCode Zen — OpenAI-compatible gateway at `https://opencode.ai/zen/v1` (`OPENCODE_BASE_URL` in `agent-context.ts`), wired via `@ai-sdk/openai` `createOpenAI`.
- Model: `mimo-v2.5-free` (OpenCode Zen free tier — reasoning model, reliable tool-calling). `CHAT_MODEL_ID` in `agent-context.ts`.
- Env: `OPENCODE_API_KEY` in `.env.local` (get it at https://opencode.ai/auth).
- Note: MiMo leaks chat-template control tokens (`<|im_end|>` etc.) into content — stripped for display in `chat-panel.tsx` (`stripControlTokens`).
- System prompt (about Kauã) lives in `src/lib/agent-context.ts` → `buildAgentSystemPrompt()`.
- Client ↔ server uses AI SDK v7 conventions: client `useChat` from `@ai-sdk/react` + `DefaultChatTransport` (from `ai`) pointed at `/api/chat`; server `convertToModelMessages` (async in v7) then `streamText`.
- Chat UI:
  - `src/components/cat-with-chat.tsx` wraps the cat Lottie + balloon + opens the panel.
  - `src/components/chat-balloon.tsx` floats 30 rotating phrases above the cat (`chat.greetings` in messages/<locale>.json).
  - `src/components/chat-panel.tsx` side drawer; persists conversation to localStorage key `kauadevbr:chat-messages`; "Reset" button clears it.
  - State shared via `src/components/chat-provider.tsx` (`useChatStore`), mounted in `src/app/[locale]/layout.tsx` next to `<Fireworks/>`.
- `useChat` memoizes the `Chat` instance by `id` — pass a stable `id` ("kaua-assistant") so the transport/messages init only runs once.
- 23 client tools total (see `getChatTools()` + `dispatchChatToolResult()` in `src/lib/chat-tools.ts`).

## Custom theme (`custom_theme` / `reset_theme` tools)
- `src/lib/custom-theme.ts` is the engine: applies a full palette as inline CSS vars on `<html>` (overrides `:root`/`.dark`), persists to localStorage `kauadevbr:custom-theme`, and exposes a `useSyncExternalStore` store.
- Derived tokens use `color-mix(in oklab, …)`; `--primary-foreground` is picked by luminance. The cat is recolored too via `customCatPalette()` (maps cat.json RGB keys to shades of `primary`).
- `CUSTOM_THEME_BOOT_SCRIPT` runs in `<head>` (in `[locale]/layout.tsx`) to apply the saved theme before paint (no FOUC).
- `src/components/custom-theme-banner.tsx` shows a top bar (i18n `customTheme.*`) to revert; rendered above `<SiteHeader/>`.

## GitHub contribution graph
- `src/components/contribution-graph.tsx` fetches `?y=<current year>` (calendar year, not rolling 12 months) and trims future days so the grid ends on today.

## GradientSpin loading
- `src/components/gradient-spinner.tsx` wraps the `gradient-spin` library (preset "sunrise").
- Used in: chat panel (assistant thinking), themed-cat-lottie loading placeholder, now-playing initial fetch.

## Conventions to keep
- Comments in Portuguese, terse, in-code rationale.
- No emojis in code unless explicitly requested.
- All locales (pt/en/es/zh) must stay in sync for any new i18n keys.
- Run `npx tsc --noEmit && npx eslint` after edits (lint may show pre-existing warnings in layout.tsx + opengraph-image.tsx — those are not from new work).