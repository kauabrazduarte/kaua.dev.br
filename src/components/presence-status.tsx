"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Calligraph } from "calligraph";

// Poll the live presence endpoint. The server caches it for ~15s, so 60s here
// keeps the dot fresh without hammering the API from every open tab.
const POLL_MS = 60 * 1000;

// Live presence label with an always-green pulsing dot. The text starts as
// "open to chat" on first render (matches SSR — no hydration flicker) and flips
// to "coding right now" when a heartbeat is alive. Backed by /api/presence.
export function PresenceStatus({ className = "" }: { className?: string }) {
  const t = useTranslations("hero");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/presence");
        if (!res.ok) return;
        const data = (await res.json()) as { working: boolean };
        if (!cancelled) setWorking(Boolean(data.working));
      } catch {
        // silent — keep the last known state
      }
    }
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Dot stays green + pulsing in both states; only the text changes
          between "coding right now" and "open to chat". */}
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
        <span className="relative inline-flex size-2 rounded-full bg-success" />
      </span>
      {/* The label morphs between "coding right now" and "open to chat" —
          shared letters glide, the rest fade through. */}
      <Calligraph
        as="span"
        variant="text"
        animation="smooth"
        trend={1}
        aria-live="polite"
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
      >
        {working ? t("statusOnline") : t("status")}
      </Calligraph>
    </div>
  );
}
