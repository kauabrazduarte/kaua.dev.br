"use client";

import * as React from "react";
import { getAge } from "@/lib/age";

const noop = () => () => {};

// Live age counter — server prerenders with the build-time value, the client
// rechecks on hydration so it's always current even if the page sits in cache.
export function AgeCounter({
  birth,
  fallback,
}: {
  birth: string;
  fallback: number;
}) {
  const age = React.useSyncExternalStore(
    noop,
    () => getAge(birth),
    () => fallback,
  );
  return <span suppressHydrationWarning>{age}</span>;
}
