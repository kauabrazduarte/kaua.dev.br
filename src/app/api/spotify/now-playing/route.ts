// Public read-only endpoint consumed by the NowPlaying client component.
// Cached for 10 seconds server-side; subsequent client requests within that
// window hit the Next.js data cache instead of Spotify.
import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/spotify";

// 10 seconds — matches the underlying Spotify fetch cache in src/lib/spotify.ts.
// (Must be a literal in route segment configs — don't import.)
export const revalidate = 10;

export async function GET() {
  const track = await getNowPlaying();
  return NextResponse.json(
    { track },
    {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
      },
    },
  );
}
