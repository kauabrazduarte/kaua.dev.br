"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface Track {
  isPlaying: boolean;
  title: string;
  artist: string;
  url: string;
  revalidateIn?: number;
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

// Fallback poll interval when nothing is playing (seconds).
const IDLE_POLL_S = 30;

// Marquee timing: pause at each end (15% of cycle), scrolling takes the
// middle 35%. Speed is content-length aware: roughly 30 pixels per second
// of travel + 5s of combined pauses, never shorter than 8 seconds.
function marqueeDurationSeconds(overflowPx: number): number {
  return Math.max(8, overflowPx / 30 + 5);
}

export function NowPlaying({ className = "" }: { className?: string }) {
  const t = useTranslations("nowPlaying");
  const [track, setTrack] = useState<Track | null>(null);
  const viewportRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  // Poll Spotify — interval is dynamic: when a track is playing we wait until
  // it ends (+5s buffer), otherwise we fall back to IDLE_POLL_S seconds.
  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function load() {
      let delayS = IDLE_POLL_S;
      try {
        const res = await fetch("/api/spotify/now-playing");
        if (res.ok) {
          const data = (await res.json()) as { track: Track | null };
          if (!cancelled) setTrack(data.track);
          delayS = data.track?.revalidateIn ?? IDLE_POLL_S;
        }
      } catch {
        // silent fail — retry after fallback delay
      }
      if (!cancelled) timeoutId = setTimeout(load, delayS * 1_000);
    }

    load();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  // Measure overflow whenever track changes or layout reflows. Using
  // ResizeObserver catches font-load, container resizes and text changes.
  useEffect(() => {
    const viewport = viewportRef.current;
    const text = textRef.current;
    if (!viewport || !text) return;

    function measure() {
      // refs may flip to null between observer callbacks; re-read each time
      const v = viewportRef.current;
      const x = textRef.current;
      if (!v || !x) return;
      const diff = x.scrollWidth - v.clientWidth;
      setOverflowPx(diff > 0 ? diff : 0);
    }
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(text);
    return () => ro.disconnect();
  }, [track]);

  if (!track) return null;

  const isOverflowing = overflowPx > 0;
  const duration = marqueeDurationSeconds(overflowPx);

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
        {"—"}
      </span>
      {/* Viewport: clips the overflowing text; min-w-0 lets it shrink inside
          the flex parent so we always know how much overflow there is. */}
      <span
        ref={viewportRef}
        className="relative min-w-0 flex-1 overflow-hidden"
      >
        <span
          ref={textRef}
          className={isOverflowing ? "marquee" : "block whitespace-nowrap"}
          style={
            isOverflowing
              ? ({
                  ["--marquee-distance" as string]: `-${overflowPx}px`,
                  animationDuration: `${duration}s`,
                } as React.CSSProperties)
              : undefined
          }
        >
          {track.artist} <span className="text-muted-foreground/60">·</span>{" "}
          {track.title}
        </span>
      </span>
    </a>
  );
}
