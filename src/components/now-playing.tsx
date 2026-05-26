"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Track {
  isPlaying: boolean;
  title: string;
  artist: string;
  url: string;
}

// Official Spotify brand green (#1DB954). Hardcoded so the icon stays the
// brand color in both light and dark themes.
const SPOTIFY_GREEN = "#1DB954";

function SpotifyIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={SPOTIFY_GREEN}
      aria-hidden
      className="spotify-beat shrink-0 origin-center transition-transform"
    >
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.39 17.31a.75.75 0 0 1-1.03.25c-2.82-1.72-6.36-2.11-10.53-1.16a.75.75 0 1 1-.33-1.46c4.56-1.04 8.48-.6 11.65 1.34a.75.75 0 0 1 .24 1.03Zm1.44-3.21a.94.94 0 0 1-1.29.31c-3.23-1.98-8.16-2.56-11.98-1.4a.94.94 0 1 1-.55-1.8c4.37-1.32 9.8-.67 13.51 1.6a.94.94 0 0 1 .31 1.29Zm.13-3.34c-3.87-2.3-10.27-2.51-13.97-1.39a1.13 1.13 0 1 1-.66-2.17c4.25-1.29 11.32-1.04 15.78 1.61a1.13 1.13 0 0 1-1.15 1.95Z" />
    </svg>
  );
}

const POLL_MS = 3 * 60 * 1000; // 3 minutes — matches server-side cache window.

export function NowPlaying({ className = "" }: { className?: string }) {
  const t = useTranslations("nowPlaying");
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/spotify/now-playing");
        if (!res.ok) return;
        const data = (await res.json()) as { track: Track | null };
        if (!cancelled) setTrack(data.track);
      } catch {
        // silent fail — UI just hides
      }
    }
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!track) return null;

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex w-full min-w-0 items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground ${className}`}
      aria-label={`${t("label")} — ${track.artist} · ${track.title}`}
    >
      <SpotifyIcon size={12} />
      <span className="shrink-0 text-foreground/70">{t("label")}</span>
      <span aria-hidden className="shrink-0 text-muted-foreground/60">
        —
      </span>
      {/* min-w-0 is required for `truncate` to actually shrink inside a flex
          child, otherwise it expands to its content's intrinsic width. */}
      <span className="min-w-0 truncate">
        {track.artist} <span className="text-muted-foreground/60">·</span>{" "}
        {track.title}
      </span>
    </a>
  );
}
