"use client";

import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CELL_PX,
  LEVEL_CLASS,
  type Cell,
} from "@/components/contribution-graph.shared";

// Below this much finger travel a touch counts as a tap, not a scroll.
const TAP_SLOP_PX = 10;

interface Props {
  /** Weeks as columns, each a 7-slot column (Sun→Sat). null = padding cell. */
  weeks: (Cell | null)[][];
  ariaLabel: string;
}

export function ContributionCells({ weeks, ariaLabel }: Props) {
  // Radix tooltips only open on hover/focus, so they never show on touch.
  // We control the open cell ourselves: hover drives it on desktop, a tap
  // toggles it on touch, and a tap elsewhere dismisses it.
  const [active, setActive] = useState<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (active === null) return;
    const dismiss = (e: PointerEvent) => {
      // Cell taps stopPropagation, so reaching here means a tap outside the
      // active cell. Ignore mouse so desktop hover isn't torn down by clicks.
      if (e.pointerType !== "mouse") setActive(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [active]);

  return (
    <TooltipProvider delayDuration={80} skipDelayDuration={300}>
      {/* The grid itself — columns are weeks, rows are weekdays (Sun→Sat). */}
      <div
        className="grid"
        role="img"
        aria-label={ariaLabel}
        style={{
          gridTemplateColumns: `repeat(${weeks.length}, ${CELL_PX}px)`,
          gridTemplateRows: `repeat(7, ${CELL_PX}px)`,
          gridAutoFlow: "column",
          gap: 2,
        }}
      >
        {weeks.flat().map((cell, i) =>
          cell ? (
            <Tooltip key={i} open={active === i}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  className={`relative rounded-[2px] outline-none transition duration-150 ${
                    active === i
                      ? "z-10 scale-[1.35] ring-1 ring-foreground/25"
                      : ""
                  } ${LEVEL_CLASS[cell.level]}`}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setActive(i);
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === "mouse") {
                      setActive((cur) => (cur === i ? null : cur));
                    }
                  }}
                  onPointerDown={(e) => {
                    if (e.pointerType === "mouse") return;
                    // Keep the document dismiss handler from firing for this
                    // touch; the tap decision happens on pointer-up.
                    e.stopPropagation();
                    touchStart.current = { x: e.clientX, y: e.clientY };
                  }}
                  onPointerUp={(e) => {
                    if (e.pointerType === "mouse" || !touchStart.current) return;
                    const dx = e.clientX - touchStart.current.x;
                    const dy = e.clientY - touchStart.current.y;
                    touchStart.current = null;
                    // A drag past the slop is a scroll — leave tooltips alone.
                    if (Math.hypot(dx, dy) > TAP_SLOP_PX) return;
                    setActive((cur) => (cur === i ? null : i));
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono text-xs font-medium text-foreground">
                  {cell.countLabel}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {cell.dateLabel}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div key={i} className="rounded-[2px] bg-transparent" />
          ),
        )}
      </div>
    </TooltipProvider>
  );
}
