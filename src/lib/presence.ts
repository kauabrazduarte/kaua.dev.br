// Live "is Kauã working right now" presence — server-only.
//
// A heartbeat is written to Redis every time I send a prompt to Claude Code
// (see scripts/presence-heartbeat.ps1 + the UserPromptSubmit hook in
// .claude/settings.json). The key carries a TTL, so presence is simply "does
// the key still exist?": if I stop working, the key expires and the site flips
// to offline on its own. No cron, no cleanup.
//
// Connection string comes from STORAGE_REDIS_URL (Vercel Redis in prod, a local
// Docker Redis in dev). When it's unset everything degrades gracefully to
// "offline" so the site never breaks just because Redis is missing.
import { createClient, type RedisClientType } from "redis";

const PRESENCE_KEY = "presence:working";

// How long a single heartbeat keeps me "online". I send prompts in bursts with
// gaps (reading code, thinking), so 30 min is wide enough to not flicker
// offline mid-session, while still going dark within half an hour of stopping.
export const PRESENCE_TTL_SECONDS = 30 * 60;

// Cached across warm serverless invocations. We memoize the connect() promise
// rather than the client so concurrent callers share one in-flight connect, and
// we null it back out on failure so the next request can retry instead of being
// stuck with a permanently-rejected promise.
let clientPromise: Promise<RedisClientType> | null = null;

function getClient(): Promise<RedisClientType> | null {
  const url = process.env.STORAGE_REDIS_URL;
  if (!url) return null;

  if (!clientPromise) {
    const client: RedisClientType = createClient({ url });
    // Without a listener, a connection drop throws an unhandled 'error' and
    // crashes the lambda. We swallow it here and let per-call try/catch decide.
    client.on("error", () => {});
    clientPromise = client
      .connect()
      .then(() => client)
      .catch((err) => {
        clientPromise = null;
        throw err;
      });
  }

  return clientPromise;
}

// Record a heartbeat: I'm working as of now. Best-effort — a Redis hiccup must
// never block the hook that calls it.
export async function touchPresence(): Promise<boolean> {
  const pending = getClient();
  if (!pending) return false;
  try {
    const client = await pending;
    await client.set(PRESENCE_KEY, String(Date.now()), {
      EX: PRESENCE_TTL_SECONDS,
    });
    return true;
  } catch {
    return false;
  }
}

// Is the heartbeat still alive? Any failure (missing URL, Redis down) reads as
// offline rather than throwing.
export async function isWorking(): Promise<boolean> {
  const pending = getClient();
  if (!pending) return false;
  try {
    const client = await pending;
    return (await client.exists(PRESENCE_KEY)) === 1;
  } catch {
    return false;
  }
}
