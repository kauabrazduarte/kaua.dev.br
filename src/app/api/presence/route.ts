// Presence endpoint.
//   POST → heartbeat. Called by my machine (Claude Code hook) with the shared
//          secret; marks me "working" for the next PRESENCE_TTL window.
//   GET  → public status read consumed by the PresenceStatus client component.
import { NextResponse } from "next/server";
import { isWorking, touchPresence } from "@/lib/presence";

// Heartbeats and status must reflect real time, so this route is always
// dynamic (never statically prerendered).
export const dynamic = "force-dynamic";

// POST is the heartbeat. Authenticated with a shared secret so only I can mark
// myself online — without it, anyone could spoof presence.
export async function POST(request: Request) {
  const token = process.env.PRESENCE_TOKEN;
  if (!token) {
    // Misconfigured server — fail loud-ish but don't leak which env is missing.
    return new NextResponse(null, { status: 503 });
  }

  const provided = request.headers.get("x-presence-token");
  if (provided !== token) {
    return new NextResponse(null, { status: 401 });
  }

  const ok = await touchPresence();
  // 204 even if Redis is momentarily down — the hook is fire-and-forget and
  // shouldn't retry-storm. 500 only signals a real write attempt that failed.
  return new NextResponse(null, { status: ok ? 204 : 500 });
}

// GET is the public read. A short server cache shields Redis from every page
// poll while keeping the indicator near-real-time.
export async function GET() {
  const working = await isWorking();
  return NextResponse.json(
    { working },
    {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
      },
    },
  );
}
