// Spotify "now playing" — server-only.
// All requests run on the server (env vars are server-only). The result is
// cached for 60 seconds via Next.js fetch revalidation.

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";

export const SPOTIFY_REDIRECT_PATH = "/api/spotify/callback";
export const SPOTIFY_SCOPES = "user-read-currently-playing user-read-playback-state";

export interface NowPlaying {
  isPlaying: boolean;
  title: string;
  artist: string;
  album?: string;
  url: string;
  albumArt?: string;
}

function basicAuthHeader(): string | null {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

// Exchange refresh token → fresh access token. We let Next.js cache the response
// for 30 minutes so we don't hammer Spotify's token endpoint (tokens are valid
// for 1h; revalidating early gives us a comfortable safety margin).
async function getAccessToken(): Promise<string | null> {
  const auth = basicAuthHeader();
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!auth || !refresh) return null;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh,
    }),
    next: { revalidate: 1800, tags: ["spotify-token"] },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

// Fetch the currently-playing track. Returns null when nothing is playing,
// when the user isn't authenticated, or on any network error.
// Cached for 60s — that's the "server action cache" the task asked for.
export async function getNowPlaying(): Promise<NowPlaying | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await fetch(NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60, tags: ["spotify-now-playing"] },
  });

  // 204 = nothing playing right now; 401 = token expired (rare with refresh flow)
  if (res.status === 204 || !res.ok) return null;

  type Track = {
    is_playing: boolean;
    item: {
      name: string;
      external_urls: { spotify: string };
      artists: { name: string }[];
      album: { name: string; images: { url: string; height: number; width: number }[] };
    } | null;
  };

  const data = (await res.json()) as Track;
  if (!data?.item) return null;

  const smallestArt = data.item.album.images
    .slice()
    .sort((a, b) => (a.height ?? 0) - (b.height ?? 0))[0];

  return {
    isPlaying: data.is_playing,
    title: data.item.name,
    artist: data.item.artists.map((a) => a.name).join(", "),
    album: data.item.album.name,
    url: data.item.external_urls.spotify,
    albumArt: smallestArt?.url,
  };
}

// Resolve the OAuth redirect URI from env. Same value must be registered in
// the Spotify Developer Dashboard for the app, exactly.
export function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return base.replace(/\/$/, "") + SPOTIFY_REDIRECT_PATH;
}
