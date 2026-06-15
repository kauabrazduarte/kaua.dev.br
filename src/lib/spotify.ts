// Spotify "now playing" — server-only.
// All requests run on the server (env vars are server-only).

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
  /** Seconds until the track ends + 5s buffer — use as next-fetch delay. */
  revalidateIn: number;
}

// Artists whose tracks should never surface on the site. Matching is
// whole-word: the artist string is normalized (lowercase, accents stripped,
// any non-alphanumeric — including punctuation — collapsed into spaces),
// then we look for the blocked term surrounded by spaces. So "key" matches
// "Key" or "Key Sounds Label" but NOT "Monkey" or "Keys".
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
    .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
    .replace(/[^a-z0-9]+/g, " ")      // any non-letter becomes a single space
    .trim();
}

function isBlocked(artist: string): boolean {
  const padded = ` ${normalize(artist)} `;
  return ARTIST_BLOCKLIST.some((blocked) => padded.includes(` ${blocked} `));
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
    cache: "no-store",
  });

  // 204 = nothing playing right now; non-OK = error.
  if (res.status === 204 || !res.ok) return null;

  type Track = {
    is_playing: boolean;
    progress_ms: number | null;
    item: {
      name: string;
      duration_ms: number;
      external_urls: { spotify: string };
      artists: { name: string }[];
      album: { name: string; images: { url: string; height: number; width: number }[] };
    } | null;
  };

  const data = (await res.json()) as Track;
  if (!data?.item) return null;

  const artist = data.item.artists.map((a) => a.name).join(", ");
  if (isBlocked(artist)) return null;

  const smallestArt = data.item.album.images.reduce<typeof data.item.album.images[number] | undefined>(
    (min, img) =>
      !min || (img.height ?? 0) < (min.height ?? 0) ? img : min,
    undefined,
  );

  const remainingMs = data.item.duration_ms - (data.progress_ms ?? 0);
  const revalidateIn = Math.ceil((remainingMs + 5_000) / 1_000);

  // Local files and some remixes carry no external URL. Fall back to a Spotify
  // search for the track so the rendered link always has a real, crawlable
  // destination (an empty href reads as a non-crawlable link to search engines).
  const url =
    data.item.external_urls?.spotify ||
    `https://open.spotify.com/search/${encodeURIComponent(`${data.item.name} ${artist}`)}`;

  return {
    isPlaying: data.is_playing,
    title: data.item.name,
    artist,
    album: data.item.album.name,
    url,
    albumArt: smallestArt?.url,
    revalidateIn,
  };
}

// Resolve the OAuth redirect URI from env. Same value must be registered in
// the Spotify Developer Dashboard for the app, exactly.
export function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return base.replace(/\/$/, "") + SPOTIFY_REDIRECT_PATH;
}
