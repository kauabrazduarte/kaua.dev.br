// Spotify "now playing" — server-only.
// All requests run on the server (env vars are server-only).

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";

export const SPOTIFY_REDIRECT_PATH = "/api/spotify/callback";
export const SPOTIFY_SCOPES =
  "user-read-currently-playing user-read-playback-state user-read-recently-played playlist-read-private";

const RECENTLY_PLAYED_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";
const PLAYLISTS_URL =
  "https://api.spotify.com/v1/me/playlists?limit=50&fields=items(id,name),next";

// Cache lifetime for the whitelist (playlist listing + track listing calls).
// Playlist contents change rarely, so a few minutes of staleness is fine.
const WHITELIST_REVALIDATE_S = 300;

// Idle poll cadence (seconds) used as revalidateIn when the shown track isn't
// actively playing, so the client keeps checking for a fresh now-playing.
const IDLE_REVALIDATE_S = 30;

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

// Only tracks that appear in one of the user's "public-safe" playlists may
// surface on the site. A playlist counts as public-safe when its ID is one
// of these (exact match against playlist.id).
const WHITELIST_PLAYLIST_MARKERS = ["0LwgY019rzCABbE4zhcZdw", "0BOFXiad46kbwmHxdCE7PN", "0tSn8GBISzCAzdegqpOHM1", "2XFpL5TXCaHBua0oXcdN3c"];

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

// Shape of a Spotify track object, shared by the currently-playing and
// recently-played endpoints.
type TrackItem = {
  id: string;
  name: string;
  duration_ms: number;
  external_urls: { spotify: string };
  artists: { name: string }[];
  album: { name: string; images: { url: string; height: number; width: number }[] };
};

// Fetch the set of track IDs belonging to the user's whitelist playlists
// (id matches an entry in WHITELIST_PLAYLIST_MARKERS). Paginates through
// both the playlist listing and each matching playlist's tracks. Cached via
// Next's data cache since playlist contents rarely change.
async function getWhitelistedTrackIds(token: string): Promise<Set<string>> {
  const headers = { Authorization: `Bearer ${token}` };
  const fetchOpts = {
    headers,
    next: { revalidate: WHITELIST_REVALIDATE_S, tags: ["spotify-whitelist"] },
  };

  const matchingPlaylistIds: string[] = [];
  let playlistsUrl: string | null = PLAYLISTS_URL;
  while (playlistsUrl) {
    const res = await fetch(playlistsUrl, fetchOpts);
    if (!res.ok) break;
    const data = (await res.json()) as {
      items?: { id: string; name: string }[];
      next: string | null;
    };
    for (const playlist of data.items ?? []) {
      if (WHITELIST_PLAYLIST_MARKERS.some((marker) => playlist.name.includes(marker)) || WHITELIST_PLAYLIST_MARKERS.some((marker) => playlist.id.includes(marker))) {
        matchingPlaylistIds.push(playlist.id);
      }
    }
    playlistsUrl = data.next;
  }

  const ids = new Set<string>();
  for (const playlistId of matchingPlaylistIds) {
    let tracksUrl: string | null =
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&fields=items(track(id)),next`;
    while (tracksUrl) {
      const res = await fetch(tracksUrl, fetchOpts);
      if (!res.ok) break;
      const data = (await res.json()) as {
        items?: { track: { id: string | null } | null }[];
        next: string | null;
      };
      for (const { track } of data.items ?? []) {
        if (track?.id) ids.add(track.id);
      }
      tracksUrl = data.next;
    }
  }

  return ids;
}

// Map a raw Spotify track into our NowPlaying shape. Returns null when the
// track isn't in the whitelist. `progressMs` is the playback position
// (null/undefined for recently-played tracks).
function mapTrack(
  item: TrackItem,
  isPlaying: boolean,
  progressMs: number | null,
  whitelist: Set<string>,
): NowPlaying | null {
  if (!whitelist.has(item.id)) return null;

  const artist = item.artists.map((a) => a.name).join(", ");

  const smallestArt = item.album.images.reduce<typeof item.album.images[number] | undefined>(
    (min, img) => (!min || (img.height ?? 0) < (min.height ?? 0) ? img : min),
    undefined,
  );

  // When actively playing, revalidate right after the track ends (+5s buffer);
  // otherwise fall back to the idle cadence so we keep polling for a new song.
  const revalidateIn = isPlaying
    ? Math.ceil((item.duration_ms - (progressMs ?? 0) + 5_000) / 1_000)
    : IDLE_REVALIDATE_S;

  // Local files and some remixes carry no external URL. Fall back to a Spotify
  // search for the track so the rendered link always has a real, crawlable
  // destination (an empty href reads as a non-crawlable link to search engines).
  const url =
    item.external_urls?.spotify ||
    `https://open.spotify.com/search/${encodeURIComponent(`${item.name} ${artist}`)}`;

  return {
    isPlaying,
    title: item.name,
    artist,
    album: item.album.name,
    url,
    albumArt: smallestArt?.url,
    revalidateIn,
  };
}

// Fetch the most recently played track as a fallback for when nothing is
// playing. Returns null on error or when the track isn't in the whitelist.
async function getRecentlyPlayed(
  token: string,
  whitelist: Set<string>,
): Promise<NowPlaying | null> {
  const res = await fetch(RECENTLY_PLAYED_URL, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { items?: { track: TrackItem | null }[] };
  const item = data.items?.[0]?.track;
  if (!item) return null;

  return mapTrack(item, false, null, whitelist);
}

// Fetch what's on the player: the currently-playing track when something is
// playing, otherwise the most recently played one (isPlaying: false). Returns
// null when the user isn't authenticated, when the track isn't in the
// whitelist, or on any network error.
export async function getNowPlaying(): Promise<NowPlaying | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const whitelist = await getWhitelistedTrackIds(token);

  const res = await fetch(NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  // 204 = nothing playing right now → fall back to recently played.
  if (res.status === 204) return getRecentlyPlayed(token, whitelist);
  if (!res.ok) return null;

  type CurrentlyPlaying = {
    is_playing: boolean;
    progress_ms: number | null;
    item: TrackItem | null;
  };

  const data = (await res.json()) as CurrentlyPlaying;
  if (!data?.item) return getRecentlyPlayed(token, whitelist);

  return mapTrack(data.item, data.is_playing, data.progress_ms, whitelist);
}

// Resolve the OAuth redirect URI from env. Same value must be registered in
// the Spotify Developer Dashboard for the app, exactly.
export function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return base.replace(/\/$/, "") + SPOTIFY_REDIRECT_PATH;
}
