// Framework-neutral constants for the contribution graph, kept OUT of the
// "use client" cell module on purpose: when a Server Component imports a value
// from a "use client" file it receives a client *reference*, not the object
// itself — which silently broke the legend swatches (LEVEL_CLASS came through
// empty, so every swatch rendered with an `undefined` color class).

export interface Cell {
  level: 0 | 1 | 2 | 3 | 4;
  countLabel: string;
  dateLabel: string;
}

/** Edge length of each calendar cell, in pixels. */
export const CELL_PX = 11;

// Tints of --primary (amber-600 in light, violet-400 in dark) via Tailwind
// opacity utilities — written as literals so the JIT generates them.
export const LEVEL_CLASS: Record<Cell["level"], string> = {
  0: "bg-muted",
  1: "bg-primary/20",
  2: "bg-primary/40",
  3: "bg-primary/65",
  4: "bg-primary",
};
