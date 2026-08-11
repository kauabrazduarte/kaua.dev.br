"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  subscribeCustomTheme,
  getCustomThemeSnapshot,
  getCustomThemeServerSnapshot,
  clearCustomTheme,
} from "@/lib/custom-theme";

/**
 * Thin bar shown at the very top of the site whenever a custom theme (set by the
 * chat agent's `custom_theme` tool) is active. Clicking it reverts to the
 * original light/dark theme.
 */
export function CustomThemeBanner() {
  const state = useSyncExternalStore(
    subscribeCustomTheme,
    getCustomThemeSnapshot,
    getCustomThemeServerSnapshot,
  );
  const t = useTranslations("customTheme");

  if (!state) return null;

  return (
    <div
      role="status"
      className="w-full border-b border-primary-foreground/15 bg-primary text-primary-foreground"
    >
      <div className="mx-auto flex w-full max-w-2xl items-center justify-center gap-2 px-6 py-1.5 text-center text-[11px] font-mono sm:text-xs">
        <span className="opacity-90">
          {t("bannerText", { name: state.name })}
        </span>
        <button
          type="button"
          onClick={() => clearCustomTheme()}
          className="shrink-0 underline decoration-primary-foreground/50 underline-offset-2 transition-opacity hover:opacity-80"
        >
          {t("revert")}
        </button>
      </div>
    </div>
  );
}
