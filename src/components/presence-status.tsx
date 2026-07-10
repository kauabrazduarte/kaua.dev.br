"use client";

import { useSyncExternalStore, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GradientSpinner } from "@/components/gradient-spinner";

const noop = () => () => {};

// Poll the live presence endpoint. The server caches it for ~15s, so 60s here
// keeps the dot fresh without hammering the API from every open tab.
const POLL_MS = 60 * 1000;

// Live presence label with an always-green pulsing dot. The text starts as
// "open to chat" on first render (matches SSR — no hydration flicker) and flips
// to "coding right now" when a heartbeat is alive. Backed by /api/presence.
export function PresenceStatus({ className = "" }: { className?: string }) {
  const t = useTranslations("hero");
  const [working, setWorking] = useState(false);
  const [loading, setLoading] = useState(true);
  const mounted = useSyncExternalStore(noop, () => true, () => false);

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
    load().finally(() => {
      if (!cancelled) setLoading(false);
    });
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
        {mounted && loading ? (
          <GradientSpinner
            rows={2}
            cols={2}
            cellSize={3}
            cellGap={1.5}
            period={650}
            label="Verificando presença"
          />
        ) : (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </>
        )}
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
