"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// Poll the live presence endpoint. The server caches it for ~15s, so 60s here
// keeps the dot fresh without hammering the API from every open tab.
const POLL_MS = 60 * 1000;

// Live "is Kauã working right now" dot. Defaults to the offline/"open to chat"
// state on first render (matches SSR — no hydration flicker) and flips to a
// pulsing green when a heartbeat is alive. Backed by /api/presence.
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
      <span className="relative flex size-2" aria-hidden>
        {/* Ping ring only while working — a static muted dot reads as idle. */}
        {working && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
        )}
        <span
          className={`relative inline-flex size-2 rounded-full ${
            working ? "bg-success" : "bg-muted-foreground/40"
          }`}
        />
      </span>
      <span
        aria-live="polite"
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
      >
        {working ? t("statusOnline") : t("status")}
      </span>
    </div>
  );
}
