// One-time OAuth helper: kicks off Spotify authorization.
// Visit /api/spotify/auth in the browser, sign in, click "Agree".
// Spotify redirects to /api/spotify/callback with a code, which exchanges it
// for the refresh_token you must paste into .env.local.
import { NextResponse } from "next/server";
import { SPOTIFY_SCOPES, getRedirectUri } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "SPOTIFY_CLIENT_ID missing in .env.local" },
      { status: 500 },
    );
  }

  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", getRedirectUri());
  url.searchParams.set("scope", SPOTIFY_SCOPES);

  return NextResponse.redirect(url.toString());
}
