"use client";

import { Calligraph } from "calligraph";
import { useEffect, useRef, useState } from "react";

// A GitHub stat number that rolls up from 0 to its real value the moment it
// first appears on screen. Calligraph's number variant animates each digit like
// an odometer. The outer span carries the IntersectionObserver target since
// Calligraph itself doesn't forward a ref.
export function AnimatedStat({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);
  // When reduced-motion is on we render the plain number on reveal — no roll.
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (reduce) setInstant(true);
        setShown(value);
        io.disconnect();
      },
      // threshold 0 → fire the instant the first pixel scrolls into view.
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {instant ? (
        value.toLocaleString()
      ) : (
        <Calligraph variant="number" animation="snappy">
          {shown}
        </Calligraph>
      )}
    </span>
  );
}
