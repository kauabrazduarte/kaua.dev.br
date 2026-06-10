"use client";

import { Calligraph } from "calligraph";
import { useEffect, useState } from "react";
import { useMessages } from "next-intl";

// How long each word stays on screen before morphing to the next.
const ROTATE_MS = 2800;

// The highlighted word in the hero tagline, cycling through a few things I
// actually build. Calligraph's text variant diffs the words character by
// character — shared letters glide to their new spot while the rest fade in
// and out. The first word matches `hero.taglineAccent`, so the SSR paint and
// the first client render agree (no hydration flicker).
export function RotatingAccent({ className }: { className?: string }) {
  const messages = useMessages() as { hero: { taglineWords: string[] } };
  const words = messages.hero.taglineWords;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    // Respect reduced-motion: hold on the first word instead of looping.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <Calligraph
      as="span"
      variant="text"
      animation="smooth"
      trend={1}
      drift={{ x: 18, y: 8 }}
      className={className}
    >
      {words[index]}
    </Calligraph>
  );
}
