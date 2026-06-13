import type { Metadata } from "next";
import QRCode from "qrcode";
import { ExternalLink } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pix" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: { canonical: `/${locale}/pix` },
  };
}

// 14-digit CNPJ → ##.###.###/####-## (e.g. 65661240000182 → 65.661.240/0001-82).
// Only the display is formatted; the copy action still uses the raw digits.
function formatCnpj(digits: string): string {
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

export default async function PixPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // `t` and the QR are independent — race them. The payload is static, so the
  // QR is generated once at build time and inlined as SVG: no client JS, no
  // third-party QR service, vector-crisp.
  const [t, qrSvg] = await Promise.all([
    getTranslations({ locale, namespace: "pix" }),
    QRCode.toString(siteConfig.pix.payload, {
      type: "svg",
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    }),
  ]);
  // Recolor to the live theme: the modules pick up `currentColor` (the page's
  // --foreground) and the background goes transparent so the themed tile shows
  // through. qrcode emits one `fill` (background rect) + one `stroke` (modules).
  const themedQr = qrSvg
    .replaceAll('fill="#ffffff"', 'fill="transparent"')
    .replaceAll('stroke="#000000"', 'stroke="currentColor"');

  // Brand-accented outline buttons — orange border/text on the cream paper
  // (violet in dark), in the home's accent spirit rather than a heavy fill.
  const brandButton =
    "w-full border-brand/40 text-brand hover:bg-brand/10 hover:text-brand";

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-12 sm:py-16">
      <header className="flex flex-col items-center text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Pix
        </span>
        <h1 className="mt-1 text-xl font-medium tracking-tight text-foreground sm:text-2xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      {/* Themed tile: a popover surface (not pure white) with the QR recolored
          to the theme foreground, so it blends in both light and dark. The QR is
          aria-hidden — the same data is exposed as the copyable key/code below. */}
      <div className="mx-auto mt-8 w-full max-w-[280px] rounded-2xl border border-border bg-popover p-5 shadow-sm">
        <div
          className="aspect-square w-full text-foreground [&>svg]:h-full [&>svg]:w-full"
          aria-hidden
          // Trusted, static, build-time QR (no user input) — safe to inline.
          // react-doctor-disable-next-line react-doctor/no-danger
          dangerouslySetInnerHTML={{ __html: themedQr }}
        />
      </div>

      <p className="mt-4 text-center text-sm text-foreground">
        {siteConfig.name}
        <span className="block font-mono text-xs text-muted-foreground">
          {siteConfig.pix.city}
        </span>
      </p>

      {/* Pix key (CNPJ) — shown and copyable. */}
      <div className="mt-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {t("keyLabel")}
        </span>
        <p className="mt-1 break-all font-mono text-sm text-foreground">
          {formatCnpj(siteConfig.pix.key)}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <CopyButton
          value={siteConfig.pix.key}
          label={t("copyKey")}
          copiedLabel={t("copied")}
          variant="outline"
          className={brandButton}
        />
        <CopyButton
          value={siteConfig.pix.payload}
          label={t("copyCode")}
          copiedLabel={t("copied")}
          variant="outline"
          className={brandButton}
        />
        <Button asChild variant="outline" className={brandButton}>
          <a
            href={siteConfig.pix.nubankUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink />
            {t("openNubank")}
          </a>
        </Button>
      </div>
    </div>
  );
}
