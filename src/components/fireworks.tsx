"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

// Desktop-only easter egg, themed (light → orange, dark → purple):
//   • Right-click anywhere   → firework bursts at the pointer.
//   • DevTools shortcuts     → blocked, and rockets launch from the bottom.
//
// NOTE: blocking DevTools shortcuts is a cosmetic gag, NOT real protection —
// DevTools can still be opened via the browser menu / right-click → Inspect.
//
// canvas-confetti is imported lazily inside the handlers, so the chunk is
// fetched only on the first effect and NEVER on touch devices (the listeners
// aren't even attached there).
export function Fireworks() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Only wire up on devices with a precise pointer + hover (i.e. a mouse +
    // keyboard). Touch-only phones/tablets bail out — no listeners, no lib.
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const palette = () =>
      resolvedTheme === "dark"
        ? ["#a855f7", "#c084fc", "#7c3aed"]
        : ["#f97316", "#fb923c", "#ea580c"];

    const load = () => import("canvas-confetti").then((m) => m.default);

    // Right-click → radial burst at the pointer.
    const handleContextMenu = async (e: MouseEvent) => {
      e.preventDefault();
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      const confetti = await load();
      if (cancelled) return;
      const base = {
        origin: { x, y },
        colors: palette(),
        spread: 360,
        disableForReducedMotion: true,
      } as const;
      confetti({ ...base, particleCount: 60, startVelocity: 28, gravity: 0.9, scalar: 0.9, ticks: 120 });
      confetti({ ...base, particleCount: 25, startVelocity: 45, gravity: 1, scalar: 1.2, ticks: 100 });
    };

    // F12 / Ctrl+Shift+I|J|C (Windows + Linux) / Cmd+Alt+I|J|C (macOS).
    // e.code is keyboard-layout independent and unaffected by Shift.
    const isDevToolsCombo = (e: KeyboardEvent) => {
      if (e.key === "F12" || e.code === "F12") return true;
      const letter = e.code === "KeyI" || e.code === "KeyJ" || e.code === "KeyC";
      if (!letter) return false;
      const winLinux = e.ctrlKey && e.shiftKey;
      const mac = e.metaKey && e.altKey;
      return winLinux || mac;
    };

    // Block the shortcut and launch a staggered row of rockets from the bottom.
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!isDevToolsCombo(e)) return;
      e.preventDefault();
      const confetti = await load();
      if (cancelled) return;
      const colors = palette();
      const launches = 6;
      for (let i = 0; i < launches; i++) {
        const x = 0.15 + (i / (launches - 1)) * 0.7;
        const t = setTimeout(() => {
          if (cancelled) return;
          confetti({
            origin: { x, y: 1 },
            colors,
            angle: 90,
            spread: 70,
            startVelocity: 65,
            particleCount: 50,
            gravity: 1.1,
            scalar: 1,
            ticks: 220,
            disableForReducedMotion: true,
          });
        }, i * 120);
        timers.push(t);
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resolvedTheme]);

  return null;
}
