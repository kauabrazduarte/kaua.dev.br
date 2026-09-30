"use client";

import { useEffect, useRef } from "react";

/**
 * Site-wide backdrop: a faint engineering grid that fades toward the bottom,
 * plus a cursor-driven layer that "lights" the grid under the pointer.
 *
 * Three things follow the mouse, each at a different speed so it reads as depth
 * rather than a single blob:
 *   1. the glow + brighter grid lines (eased, lags behind the cursor),
 *   2. the grid cell under the cursor (snapped, moves cell to cell),
 *   3. a crosshair with live coordinates, pinned to the eased position.
 *
 * All colours come from theme variables (--foreground / --primary), so it also
 * follows the custom themes the chat agent can paint. Position updates write CSS
 * variables straight onto the DOM node — no React re-renders while moving.
 * Touch devices only get the static grid; reduced-motion users get the same
 * effects without easing.
 */

const CELL = 48; // keep in sync with --grid-cell in globals.css

export function AmbientGrid() {
  const rootRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const coords = coordsRef.current;
    if (!root || !coords) return;

    // Skip the interactive layer on touch-only devices.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let x = targetX;
    let y = targetY;
    let raf = 0;
    let lastCol = -1;
    let lastRow = -1;

    const paint = () => {
      root.style.setProperty("--gx", `${x.toFixed(1)}px`);
      root.style.setProperty("--gy", `${y.toFixed(1)}px`);
    };

    const tick = () => {
      const ease = reduced.matches ? 1 : 0.14;
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      paint();
      if (Math.abs(targetX - x) > 0.3 || Math.abs(targetY - y) > 0.3) {
        raf = requestAnimationFrame(tick);
      } else {
        x = targetX;
        y = targetY;
        paint();
        raf = 0;
      }
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      const col = Math.floor(targetX / CELL);
      const row = Math.floor(targetY / CELL);
      if (col !== lastCol || row !== lastRow) {
        lastCol = col;
        lastRow = row;
        root.style.setProperty("--cx", `${col * CELL}px`);
        root.style.setProperty("--cy", `${row * CELL}px`);
        coords.textContent = `${String(col).padStart(2, "0")}:${String(row).padStart(2, "0")}`;
      }

      root.dataset.active = "true";
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      root.dataset.active = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-active="false"
      className="ambient-grid pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="ambient-grid__wash" />
      <div className="ambient-grid__lines" />
      <div className="ambient-grid__lines ambient-grid__lines--lit" />
      <div className="ambient-grid__glow" />
      <div className="ambient-grid__cell" />
      <div className="ambient-grid__cross">
        <span ref={coordsRef} className="ambient-grid__coords">
          00:00
        </span>
      </div>
    </div>
  );
}
