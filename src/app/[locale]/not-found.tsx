import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Explicit noindex — error pages should never appear in SERPs.
export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      {/* --primary is the theme accent: amber/orange in light, violet in dark. */}
      <p className="font-mono text-7xl font-medium leading-none tracking-tight text-primary sm:text-8xl">
        404
      </p>

      <div className="space-y-2">
        <h1 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <Link
        href="/"
        className="group mt-1 inline-flex items-center gap-1.5 font-mono text-sm text-foreground underline decoration-foreground/30 decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
      >
        <span
          aria-hidden
          className="transition-transform group-hover:-translate-x-0.5"
        >
          ←
        </span>
        {t("cta")}
      </Link>
    </div>
  );
}
