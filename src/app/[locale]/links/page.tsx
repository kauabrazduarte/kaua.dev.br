import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Coffee, Mail, QrCode } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "links" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: { canonical: `/${locale}/links` },
  };
}

// Monochrome brand glyphs — same marks the home uses (social-icon.tsx), so the
// page reads as part of the same site instead of a sea of branded logos.
function GitHubGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-5">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.69-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.19 1.18.92-.26 1.91-.39 2.9-.39.98 0 1.98.13 2.9.39 2.22-1.49 3.19-1.18 3.19-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56 4.56-1.52 7.85-5.83 7.85-10.91C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[18px]">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default async function LinksPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "links" });

  const items: {
    key: string;
    href: string;
    internal?: boolean;
    label: string;
    sub: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "github",
      href: siteConfig.links.github,
      label: "GitHub",
      sub: `@${siteConfig.github.username}`,
      icon: <GitHubGlyph />,
    },
    {
      key: "x",
      href: siteConfig.links.x,
      label: "X",
      sub: siteConfig.handle,
      icon: <XGlyph />,
    },
    {
      key: "email",
      href: siteConfig.links.email,
      label: "Email",
      sub: siteConfig.links.email.replace("mailto:", ""),
      icon: <Mail className="size-5" />,
    },
    {
      key: "coffee",
      href: siteConfig.links.buymeacoffee,
      label: t("coffee"),
      sub: siteConfig.links.buymeacoffee.replace("https://", ""),
      icon: <Coffee className="size-5" />,
    },
    {
      key: "pix",
      href: "/pix",
      internal: true,
      label: "Pix",
      sub: t("pixSub"),
      icon: <QrCode className="size-5" />,
    },
  ];

  // Same token set as the Button `outline` variant on the home: hairline border,
  // transparent surface, accent on hover. No literal colors.
  const rowClass =
    "group flex items-center gap-4 rounded-2xl border border-border bg-transparent px-4 py-3.5 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";

  return (
    <div className="mx-auto w-full max-w-md px-6 py-12 sm:py-16">
      <header className="flex flex-col items-center text-center">
        <Image
          src={siteConfig.github.avatar}
          alt={siteConfig.name}
          width={72}
          height={72}
          priority
          className="size-16 rounded-full"
        />
        <h1 className="mt-4 text-lg font-medium tracking-tight text-foreground">
          {siteConfig.name}
        </h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {siteConfig.handle}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <nav className="mt-8 flex flex-col gap-3" aria-label={t("title")}>
        {items.map((item) => {
          const inner = (
            <>
              <span className="flex size-9 shrink-0 items-center justify-center text-foreground">
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block truncate font-mono text-xs text-muted-foreground">
                  {item.sub}
                </span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
            </>
          );

          return item.internal ? (
            <Link key={item.key} href={item.href} className={rowClass}>
              {inner}
            </Link>
          ) : (
            <a
              key={item.key}
              href={item.href}
              {...(item.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={cn(rowClass)}
            >
              {inner}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
