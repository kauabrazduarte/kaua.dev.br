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
 * On mobile, the highlight wanders between random cells every 3–8 seconds.
 * Reduced-motion users keep the static grid on mobile.
 */

const CELL = 48; // keep in sync with --grid-cell in globals.css

export function AmbientGrid() {
  const rootRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const coords = coordsRef.current;
    if (!root || !coords) return;

    const mobile = window.matchMedia("(max-width: 767px) and (hover: none) and (pointer: coarse)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop = () => {};

    const start = () => {
      stop();
      const wandering = mobile.matches && !reduced.matches;
      if (!wandering && !finePointer.matches) {
        root.dataset.active = "false";
        return;
      }

      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight / 3;
      let x = targetX;
      let y = targetY;
      let raf = 0;
      let timer = 0;
      let lastCol = -1;
      let lastRow = -1;

      const paint = () => {
        root.style.setProperty("--gx", `${x.toFixed(1)}px`);
        root.style.setProperty("--gy", `${y.toFixed(1)}px`);
        const col = Math.floor(x / CELL);
        const row = Math.floor(y / CELL);
        if (col !== lastCol || row !== lastRow) {
          lastCol = col;
          lastRow = row;
          root.style.setProperty("--cx", `${col * CELL}px`);
          root.style.setProperty("--cy", `${row * CELL}px`);
          coords.textContent = `${String(col).padStart(2, "0")}:${String(row).padStart(2, "0")}`;
        }
      };

      const tick = () => {
        const ease = reduced.matches ? 1 : wandering ? 0.055 : 0.14;
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

      if (wandering) {
        const pickCell = () => {
          const columns = Math.max(1, Math.floor(window.innerWidth / CELL));
          const rows = Math.max(1, Math.floor(window.innerHeight / CELL));
          const col = Math.floor(Math.random() * columns);
          const row = Math.floor(Math.random() * rows);
          targetX = col * CELL + CELL / 2;
          targetY = row * CELL + CELL / 2;
        };
        const wander = () => {
          const previousX = targetX;
          const previousY = targetY;
          // Avoid a stationary interval when the viewport has another cell.
          do {
            pickCell();
          } while (targetX === previousX && targetY === previousY &&
            (window.innerWidth >= CELL * 2 || window.innerHeight >= CELL * 2));
          if (!raf) raf = requestAnimationFrame(tick);
          timer = window.setTimeout(wander, 3000 + Math.random() * 5000);
        };
        pickCell();
        x = targetX;
        y = targetY;
        paint();
        root.dataset.active = "true";
        timer = window.setTimeout(wander, 3000 + Math.random() * 5000);
      } else {
        root.dataset.active = "false";
      }

      const onMove = (e: PointerEvent) => {
        if (wandering) return;
        targetX = e.clientX;
        targetY = e.clientY;
        root.dataset.active = "true";
        if (!raf) raf = requestAnimationFrame(tick);
      };
      const onLeave = () => {
        if (!wandering) root.dataset.active = "false";
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      stop = () => {
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        window.clearTimeout(timer);
        if (raf) cancelAnimationFrame(raf);
      };
    };

    mobile.addEventListener("change", start);
    finePointer.addEventListener("change", start);
    reduced.addEventListener("change", start);
    start();
    return () => {
      stop();
      mobile.removeEventListener("change", start);
      finePointer.removeEventListener("change", start);
      reduced.removeEventListener("change", start);
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
