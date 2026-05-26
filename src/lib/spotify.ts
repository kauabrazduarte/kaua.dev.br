// Spotify "now playing" — server-only.
// All requests run on the server (env vars are server-only). The result is
// cached for 3 minutes to match the client polling interval.

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";

export const SPOTIFY_REDIRECT_PATH = "/api/spotify/callback";
export const SPOTIFY_SCOPES = "user-read-currently-playing user-read-playback-state";

// Server-side cache window in seconds — matches the client's polling cadence.
export const NOW_PLAYING_CACHE_SECONDS = 180;

export interface NowPlaying {
  isPlaying: boolean;
  title: string;
  artist: string;
  album?: string;
  url: string;
  albumArt?: string;
}

// Artists whose tracks should never surface on the site. Matching is "contains"
// over the normalized form (lowercase, diacritics stripped) so spelling and
// accent variations are caught.
const ARTIST_BLOCKLIST: string[] = [
  "chata",
  "riya",
  "celine dion",
  "sawano",
  "visual arts",
  "key",
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function isBlocked(artist: string): boolean {
  const n = normalize(artist);
  return ARTIST_BLOCKLIST.some((blocked) => n.includes(blocked));
}

function basicAuthHeader(): string | null {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

// Exchange refresh token → fresh access token. Cached for 30 minutes — tokens
// are valid for 1h, so revalidating early leaves a comfortable safety margin.
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
// when the user isn't authenticated, when the artist is on the blocklist, or
// on any network error.
export async function getNowPlaying(): Promise<NowPlaying | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await fetch(NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${token}` },
    next: {
      revalidate: NOW_PLAYING_CACHE_SECONDS,
      tags: ["spotify-now-playing"],
    },
  });

  // 204 = nothing playing right now; non-OK = error.
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

  const artist = data.item.artists.map((a) => a.name).join(", ");
  if (isBlocked(artist)) return null;

  const smallestArt = data.item.album.images
    .slice()
    .sort((a, b) => (a.height ?? 0) - (b.height ?? 0))[0];

  return {
    isPlaying: data.is_playing,
    title: data.item.name,
    artist,
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
