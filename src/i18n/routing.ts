import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "es", "zh"],
  defaultLocale: "pt",
  // "always" → /pt and /en URLs are stable; no 307 redirect when crawlers
  // fetch /pt/opengraph-image (was the case with "as-needed").
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
