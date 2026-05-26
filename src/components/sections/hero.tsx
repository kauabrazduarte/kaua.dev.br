import Image from "next/image";
import { useTranslations } from "next-intl";
import { siteConfig } from "@/lib/site";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section id="top" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-2xl px-6 pb-12 pt-14 sm:pb-16 sm:pt-20">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {t("status")}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Image
            src={siteConfig.github.avatar}
            alt={siteConfig.name}
            width={56}
            height={56}
            priority
            className="h-12 w-12 shrink-0 rounded-full"
          />
          <div className="leading-snug">
            <h1 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
              {siteConfig.name}
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              {t("role")} · {t("based")}
            </p>
          </div>
        </div>

        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          <Tagline />
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <a
            href="#projects"
            className="group inline-flex items-center gap-1.5 text-foreground underline decoration-foreground/30 decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {t("primaryCta")}
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
          <a
            href="#contact"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("secondaryCta")}
          </a>
        </div>
      </div>
    </section>
  );
}

function Tagline() {
  const t = useTranslations("hero");
  const accent = t("taglineAccent");
  const full = t("tagline", { accent });
  const parts = full.split(accent);
  return (
    <>
      {parts.map((chunk, i) => (
        <span key={i}>
          {chunk}
          {i < parts.length - 1 ? (
            <span className="text-foreground">{accent}</span>
          ) : null}
        </span>
      ))}
    </>
  );
}
