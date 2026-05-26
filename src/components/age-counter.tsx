"use client";

import * as React from "react";
import { getAge } from "@/lib/age";

// Live age counter — server prerenders with the build-time value, the client
// rechecks on hydration so it's always current even if the page sits in cache.
export function AgeCounter({
  birth,
  fallback,
}: {
  birth: string;
  fallback: number;
}) {
  const [age, setAge] = React.useState(fallback);
  React.useEffect(() => setAge(getAge(birth)), [birth]);
  return <span suppressHydrationWarning>{age}</span>;
}
