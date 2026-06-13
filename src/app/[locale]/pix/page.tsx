import type { Metadata } from "next";
import QRCode from "qrcode";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CopyButton } from "@/components/copy-button";
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

export default async function PixPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pix" });

  // The payload is static, so this QR is generated once at build time and
  // inlined as SVG — no client JS, no third-party QR service, scannable on a
  // white tile in both light and dark themes.
  const qrSvg = await QRCode.toString(siteConfig.pix.payload, {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });

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

      {/* White tile keeps the QR high-contrast (and scannable) even in dark mode. */}
      <div className="mx-auto mt-8 w-full max-w-[280px] rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div
          className="aspect-square w-full [&>svg]:h-full [&>svg]:w-full"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: qrSvg }}
          aria-label={t("qrAlt")}
          role="img"
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
          {siteConfig.pix.key}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <CopyButton
          value={siteConfig.pix.key}
          label={t("copyKey")}
          copiedLabel={t("copied")}
          className="w-full"
        />
        <CopyButton
          value={siteConfig.pix.payload}
          label={t("copyCode")}
          copiedLabel={t("copied")}
          variant="outline"
          className="w-full"
        />
      </div>
    </div>
  );
}
