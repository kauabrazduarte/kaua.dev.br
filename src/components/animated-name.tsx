"use client";

import { Calligraph } from "calligraph";

// One-shot entrance: the name's characters slide up into place on mount via
// Calligraph's LCS text engine. `autoSize` is off so the heading keeps a stable
// width and the letters animate in place rather than the box expanding.
export function AnimatedName({ text }: { text: string }) {
  return (
    <Calligraph
      as="span"
      variant="text"
      animation="smooth"
      initial
      trend={1}
      stagger={0.035}
      drift={{ x: 6, y: 10 }}
      autoSize={false}
    >
      {text}
    </Calligraph>
  );
}
