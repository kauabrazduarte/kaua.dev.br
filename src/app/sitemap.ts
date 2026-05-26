import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/lib/site";

const LANGUAGE_TAG: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
  zh: "zh-CN",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Per-URL hreflang map — same for every entry; x-default points to the
  // unprefixed root so locale-less crawlers and ambiguous regions land
  // somewhere sensible.
  const languages: Record<string, string> = {
    ...Object.fromEntries(
      routing.locales.map((l) => [LANGUAGE_TAG[l], `${siteConfig.url}/${l}`]),
    ),
    "x-default": siteConfig.url,
  };
  return routing.locales.map((locale) => ({
    url: `${siteConfig.url}/${locale}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: { languages },
  }));
}
