import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const track = await getNowPlaying();
  return NextResponse.json(
    { track },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
