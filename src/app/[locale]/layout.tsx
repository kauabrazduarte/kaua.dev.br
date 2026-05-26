import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("title"),
      template: `%s — ${siteConfig.shortName}`,
    },
    description: t("description"),
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    keywords: [...siteConfig.keywords],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "pt-BR": "/pt",
        "en-US": "/en",
        "es-ES": "/es",
        "zh-CN": "/zh",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale:
        locale === "pt"
          ? "pt_BR"
          : locale === "es"
            ? "es_ES"
            : locale === "zh"
              ? "zh_CN"
              : "en_US",
      url: `${siteConfig.url}/${locale}`,
      siteName: siteConfig.name,
      title: t("title"),
      description: t("description"),
      // Image is provided by /app/[locale]/opengraph-image.tsx (file convention)
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      creator: siteConfig.handle,
      site: siteConfig.handle,
      // Image is provided by /app/[locale]/twitter-image.tsx (file convention)
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    manifest: "/manifest.webmanifest",
    category: "technology",
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  // SSR-rendered quote text per locale (next-intl reads from messages/<locale>.json
  // server-side, so the translated text lives in the initial HTML — no client
  // hydration, fully indexable by crawlers).
  const tFooter = await getTranslations({ locale, namespace: "footer" });
  const QUOTE = tFooter("quote");

  // BCP-47 language tag per locale, used in JSON-LD's `inLanguage` and the
  // <blockquote lang="…"> attribute so search engines and screen readers can
  // attribute the text to the correct language.
  const LANGUAGE_TAG: Record<string, string> = {
    pt: "pt-BR",
    en: "en-US",
    es: "es-ES",
    zh: "zh-CN",
  };
  const langTag = LANGUAGE_TAG[locale] ?? "en-US";

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteConfig.url}#person`,
    name: siteConfig.name,
    alternateName: [siteConfig.shortName, "kauadevbr", "kauabrazduarte"],
    url: siteConfig.url,
    image: siteConfig.github.avatar,
    birthDate: siteConfig.birth,
    nationality: { "@type": "Country", name: "Brazil" },
    sameAs: [siteConfig.links.github, siteConfig.links.x],
    jobTitle:
      locale === "pt"
        ? "Desenvolvedor Full-Stack"
        : locale === "es"
          ? "Desarrollador Full-Stack"
          : locale === "zh"
            ? "全栈开发者"
            : "Full-Stack Developer",
    description:
      (siteConfig.description as Record<string, string>)[locale] ??
      siteConfig.description.en,
    knowsLanguage: ["pt-BR", "en", "es", "zh"],
    knowsAbout: [
      "Bun",
      "Node.js",
      "Deno",
      "TypeScript",
      "JavaScript",
      "PHP",
      "Python",
      "React",
      "Next.js",
      "Astro",
      "Tailwind CSS",
      "PostgreSQL",
      "Prisma",
      "Supabase",
      "Docker",
      "Vercel",
      "OAuth",
      "AI Automation",
      "Claude Code",
      "Anthropic API",
      "OpenAI Codex",
    ],
    worksFor: siteConfig.workplaces.map((w) => ({
      "@type": "Organization",
      name: w.name,
      ...(w.aka ? { alternateName: w.aka } : {}),
    })),
  };

  // Quotation schema marks the footer line as a unique, attributable quote so
  // exact-phrase searches can surface this site in any of the four languages.
  // Each locale gets its own @id (so /pt#quote, /en#quote, …) and the PT version
  // is the canonical "original work"; the others declare themselves as
  // translationOfWork pointing at it — this is the schema.org-blessed way to
  // tell search engines "same idea, translated".
  const quoteJsonLd = {
    "@context": "https://schema.org",
    "@type": "Quotation",
    "@id": `${siteConfig.url}/${locale}#quote`,
    text: QUOTE,
    inLanguage: langTag,
    creator: { "@id": `${siteConfig.url}#person` },
    spokenByCharacter: { "@id": `${siteConfig.url}#person` },
    url: `${siteConfig.url}/${locale}#quote`,
    ...(locale === "pt"
      ? {
          // PT is the original; declare the translations so Google links them.
          workTranslation: routing.locales
            .filter((l) => l !== "pt")
            .map((l) => ({
              "@type": "Quotation",
              "@id": `${siteConfig.url}/${l}#quote`,
              inLanguage: LANGUAGE_TAG[l],
            })),
        }
      : {
          // Non-PT locales are translations of the PT original.
          translationOfWork: {
            "@type": "Quotation",
            "@id": `${siteConfig.url}/pt#quote`,
            inLanguage: "pt-BR",
          },
        }),
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.url}#website`,
      url: siteConfig.url,
      name: siteConfig.name,
    },
  };

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(quoteJsonLd) }}
        />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-dvh flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
              <figure
                id="quote"
                className="mx-auto w-full max-w-2xl px-6 pb-10 pt-2 text-center"
              >
                <blockquote
                  cite={`${siteConfig.url}/${locale}#quote`}
                  lang={langTag}
                  className="text-xs italic text-muted-foreground/70"
                >
                  <p>&ldquo;{QUOTE}&rdquo;</p>
                </blockquote>
                {/* Attribution is hidden visually but kept in the DOM so
                    crawlers can tie the quote to its author. */}
                <figcaption className="sr-only">
                  — {siteConfig.name}
                </figcaption>
              </figure>
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
