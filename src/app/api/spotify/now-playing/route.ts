// Public read-only endpoint consumed by the NowPlaying client component.
// Cached for 60s server-side; subsequent client requests within that window
// hit the Next.js data cache instead of Spotify.
import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/spotify";

export const revalidate = 60;

export async function GET() {
  const track = await getNowPlaying();
  return NextResponse.json(
    { track },
    {
      headers: {
        // Edge / CDN cache hint mirrors the server revalidate window.
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
