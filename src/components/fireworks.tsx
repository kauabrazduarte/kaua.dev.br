"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

// Desktop-only easter egg: double-click anywhere to launch a firework at the
// pointer, themed (light → orange, dark → purple). canvas-confetti is loaded
// lazily inside the handler, so the chunk is fetched only on the first burst
// and NEVER on touch devices (the listener isn't even attached there).
export function Fireworks() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Only wire up on devices with a precise pointer + hover (i.e. a mouse).
    // Touch-only phones/tablets bail out here — no listener, no lib download.
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    let cancelled = false;

    const handleDoubleClick = async (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      const { default: confetti } = await import("canvas-confetti");
      if (cancelled) return;

      const colors =
        resolvedTheme === "dark"
          ? ["#a855f7", "#c084fc", "#7c3aed"]
          : ["#f97316", "#fb923c", "#ea580c"];

      const base = {
        origin: { x, y },
        colors,
        spread: 360,
        disableForReducedMotion: true,
      } as const;

      confetti({
        ...base,
        particleCount: 60,
        startVelocity: 28,
        gravity: 0.9,
        scalar: 0.9,
        ticks: 120,
      });
      confetti({
        ...base,
        particleCount: 25,
        startVelocity: 45,
        gravity: 1,
        scalar: 1.2,
        ticks: 100,
      });
    };

    window.addEventListener("dblclick", handleDoubleClick);
    return () => {
      cancelled = true;
      window.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [resolvedTheme]);

  return null;
}
