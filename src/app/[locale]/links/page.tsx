import type { Metadata } from "next";
import { ArrowUpRight, Coffee, Mail, QrCode } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { AvatarLightbox } from "@/components/avatar-lightbox";

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
      key: "whatsapp",
      href: siteConfig.links.whatsapp,
      label: "WhatsApp",
      sub: siteConfig.whatsapp.display,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.362.195 1.878.118.573-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.99 2.901a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.538 1.465 15.87.448 12.039.449 6.269.451 1.588 5.132 1.586 10.902c0 1.719.448 3.388 1.298 4.859L1.5 20.762l5.098-1.335a9.717 9.717 0 004.648 1.185h.004c5.77 0 10.451-4.681 10.453-10.451.001-2.832-1.1-5.493-3.183-7.613z" />
        </svg>
      ),
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
        <AvatarLightbox
          src={siteConfig.github.avatar}
          alt={siteConfig.name}
          size={72}
          thumbClassName="size-16"
          priority
        />
        <h1 className="mt-4 text-lg font-medium tracking-tight text-foreground">
          {siteConfig.name}
        </h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          <a
            href={siteConfig.links.x}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            {siteConfig.handle}
          </a>
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
