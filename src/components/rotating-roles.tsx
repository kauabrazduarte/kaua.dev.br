"use client";

import "slot-text/style.css";
import { useEffect, useState } from "react";
import { SlotText } from "slot-text/react";

interface Props {
  /** Phrases to cycle through, in order. */
  phrases: string[];
  /** Milliseconds each phrase stays before rolling to the next. */
  intervalMs?: number;
  className?: string;
}

/**
 * Rolls through a list of short role labels with slot-text's springy
 * per-character animation, advancing on a fixed interval.
 */
export function RotatingRoles({ phrases, intervalMs = 4000, className = "" }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phrases.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [phrases.length, intervalMs]);

  return (
    <SlotText
      text={phrases[index] ?? ""}
      options={{ direction: "up", bounce: 0.7 }}
      className={`font-mono text-xs text-muted-foreground ${className}`}
    />
  );
}
