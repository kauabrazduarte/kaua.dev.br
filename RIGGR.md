# Project Memory — kaua.dev.br

## AI Chat (OpenRouter + Vercel AI SDK)
- Chat agent: `/api/chat` (route handler) — streams via Vercel AI SDK v7 (`streamText` + `toUIMessageStreamResponse`).
- Model: `nvidia/nemotron-3-nano-30b-a3b:free` (OpenRouter free tier).
- Env: `OPEN_ROUTER_API_KEY` in `.env.local` (currently empty — must be filled before chat works).
- System prompt (about Kauã) lives in `src/lib/agent-context.ts` → `buildAgentSystemPrompt()`.
- Client ↔ server uses AI SDK v7 conventions: client `useChat` from `@ai-sdk/react` + `DefaultChatTransport` (from `ai`) pointed at `/api/chat`; server `convertToModelMessages` (async in v7) then `streamText`.
- Chat UI:
  - `src/components/cat-with-chat.tsx` wraps the cat Lottie + balloon + opens the panel.
  - `src/components/chat-balloon.tsx` floats 30 rotating phrases above the cat (`chat.greetings` in messages/<locale>.json).
  - `src/components/chat-panel.tsx` side drawer; persists conversation to localStorage key `kauadevbr:chat-messages`; "Reset" button clears it.
  - State shared via `src/components/chat-provider.tsx` (`useChatStore`), mounted in `src/app/[locale]/layout.tsx` next to `<Fireworks/>`.
- `useChat` memoizes the `Chat` instance by `id` — pass a stable `id` ("kaua-assistant") so the transport/messages init only runs once.

## GradientSpin loading
- `src/components/gradient-spinner.tsx` wraps the `gradient-spin` library (preset "sunrise").
- Used in: chat panel (assistant thinking), themed-cat-lottie loading placeholder, now-playing initial fetch.

## Conventions to keep
- Comments in Portuguese, terse, in-code rationale.
- No emojis in code unless explicitly requested.
- All locales (pt/en/es/zh) must stay in sync for any new i18n keys.
- Run `npx tsc --noEmit && npx eslint` after edits (lint may show pre-existing warnings in layout.tsx + opengraph-image.tsx — those are not from new work).