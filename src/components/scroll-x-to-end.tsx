"use client";

import { useLayoutEffect, useRef } from "react";

interface Props {
  className?: string;
  children: React.ReactNode;
}

/**
 * Horizontal scroll container that starts scrolled to its right edge (the most
 * recent items) whenever the content overflows. Keeps the scroll position on
 * re-renders; only re-snaps to the end when the content arrives or the
 * viewport grows enough to newly enable overflow.
 */
export function ScrollXToEnd({ className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const snap = () => {
      // Only snap when the viewport is at the left edge — i.e. before the
      // user has touched it (or after overflow freshly appears). This keeps
      // an actively-scrolled or resized view from being yanked back.
      if (el.scrollLeft === 0 && el.scrollWidth > el.clientWidth) {
        el.scrollLeft = el.scrollWidth - el.clientWidth;
      }
    };

    // Snap on mount (content may already be present) and whenever the width
    // of the scrollable content changes.
    snap();

    const ro = new ResizeObserver(snap);
    ro.observe(el);
    // Observe the first child so new content nudging width re-triggers a snap.
    if (el.firstElementChild instanceof Element) ro.observe(el.firstElementChild);

    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}