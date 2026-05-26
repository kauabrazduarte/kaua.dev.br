// One-time OAuth helper: kicks off Spotify authorization.
// Visit /api/spotify/auth in the browser, sign in, click "Agree".
// Spotify redirects to /api/spotify/callback with a code, which exchanges it
// for the refresh_token you must paste into .env.local.
import { NextResponse } from "next/server";
import { SPOTIFY_SCOPES, getRedirectUri } from "@/lib/spotify";

export const dynamic = "force-dynamic";

// One-shot setup tool: flip to `true` only when you need to (re)run the OAuth
// flow to obtain a fresh refresh_token. Keep it `false` in production so the
// route returns 404 to outsiders.
const OAUTH_ENABLED = false;

export function GET(req: Request) {
  if (!OAUTH_ENABLED) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "SPOTIFY_CLIENT_ID missing in env" },
      { status: 500 },
    );
  }

  const redirectUri = getRedirectUri();

  // ?debug=1 → returns what we're about to send instead of redirecting, so you
  // can compare exactly against what's registered in the Spotify Dashboard.
  if (new URL(req.url).searchParams.has("debug")) {
    return NextResponse.json({
      clientId,
      redirectUri,
      scopes: SPOTIFY_SCOPES,
      nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
      hint: "The 'redirectUri' above must be registered VERBATIM in your Spotify Dashboard → Settings → Redirect URIs (case-sensitive, no trailing slash, exact protocol).",
    });
  }

  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", SPOTIFY_SCOPES);

  return NextResponse.redirect(url.toString());
}
