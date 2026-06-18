"use client";

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

interface Props {
  /** Weeks as columns, each a 7-slot column (Sun→Sat). null = padding cell. */
  weeks: (Cell | null)[][];
  ariaLabel: string;
}

export function ContributionCells({ weeks, ariaLabel }: Props) {
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
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div
                  className={`relative rounded-[2px] outline-none transition duration-150 hover:z-10 hover:scale-[1.35] hover:ring-1 hover:ring-foreground/25 ${LEVEL_CLASS[cell.level]}`}
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
