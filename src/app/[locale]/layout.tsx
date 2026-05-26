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
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "pt" ? "pt_BR" : "en_US",
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

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
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
        : "Full-Stack Developer",
    description:
      locale === "pt"
        ? siteConfig.description.pt
        : siteConfig.description.en,
    knowsLanguage: ["pt-BR", "en"],
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
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
