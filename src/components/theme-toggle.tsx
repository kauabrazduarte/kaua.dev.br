"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import MoonIcon from "@/components/ui/moon-icon";
import BrightnessDownIcon from "@/components/ui/brightness-down-icon";
import type { AnimatedIconHandle } from "@/components/ui/types";

const noop = () => () => {};

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations("nav");
  const mounted = React.useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  const moonRef = React.useRef<AnimatedIconHandle>(null);
  const sunRef = React.useRef<AnimatedIconHandle>(null);

  const isDark = mounted && resolvedTheme === "dark";

  function toggle() {
    setTheme(isDark ? "light" : "dark");
    // Trigger the icon's animation on click (the icons also animate on hover
    // out of the box; we replay it on click so the state change feels alive).
    (isDark ? sunRef : moonRef).current?.startAnimation();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("theme")}
      title={t("theme")}
      className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {/* Render the placeholder shape while not mounted to avoid a flash. */}
      <span className="inline-flex size-[18px] items-center justify-center" aria-hidden>
        {!mounted ? (
          <span className="size-[18px]" />
        ) : isDark ? (
          <BrightnessDownIcon ref={sunRef} size={18} strokeWidth={1.8} />
        ) : (
          <MoonIcon ref={moonRef} size={18} strokeWidth={1.8} />
        )}
      </span>
    </button>
  );
}
