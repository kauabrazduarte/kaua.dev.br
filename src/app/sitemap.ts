import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/lib/site";

const LANGUAGE_TAG: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
  zh: "zh-CN",
};

// Localized routes worth indexing. `segment` is the path after the locale
// (empty for the home). `priority` is for the default-locale entry; non-default
// locales get a small discount below.
const PATHS = [
  { segment: "", priority: 1 },
  { segment: "/links", priority: 0.6 },
  { segment: "/pix", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PATHS.flatMap(({ segment, priority }) => {
    // Per-URL hreflang map: every locale of THIS path, plus an x-default that
    // points to the unprefixed URL (which redirects to the default locale) so
    // locale-less crawlers land somewhere sensible.
    const languages: Record<string, string> = {
      ...Object.fromEntries(
        routing.locales.map((l) => [
          LANGUAGE_TAG[l],
          `${siteConfig.url}/${l}${segment}`,
        ]),
      ),
      "x-default": `${siteConfig.url}${segment}`,
    };
    return routing.locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${segment}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: locale === routing.defaultLocale ? priority : priority - 0.2,
      alternates: { languages },
    }));
  });
}
