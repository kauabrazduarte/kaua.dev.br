import { useTranslations } from "next-intl";
import { siteConfig } from "@/lib/site";
import { WatercolorLandscape } from "@/components/watercolor-landscape";
import { NowPlaying } from "@/components/now-playing";
import { PresenceStatus } from "@/components/presence-status";
import { RotatingRoles } from "@/components/rotating-roles";
import { HeroContactInfo } from "@/components/hero-contact-info";
import { AvatarLightbox } from "@/components/avatar-lightbox";

export function HeroSection() {
  const t = useTranslations("hero");
  const roles = t.raw("roles") as string[];
  const email = siteConfig.links.email.replace(/^mailto:/, "");

  return (
    <section id="top" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-2xl sm:px-6">
        <WatercolorLandscape />
      </div>

      <div className="mx-auto w-full max-w-2xl px-6 pb-12 sm:pb-16">
        <div className="relative flex items-start gap-3 sm:gap-4">
          <div className="-mt-8 ml-3 shrink-0 rounded-2xl border border-border bg-white p-1 shadow-sm sm:-mt-10 sm:ml-4">
            <AvatarLightbox
              src={siteConfig.github.avatar}
              alt={siteConfig.name}
              size={88}
              thumbClassName="size-[72px] sm:size-[88px]"
              priority
            />
          </div>
          <div className="min-w-0 pt-3 leading-snug">
            <h1 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
              {siteConfig.name}
            </h1>
            <div className="mt-0.5">
              <RotatingRoles phrases={roles} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <PresenceStatus />
        </div>

        <NowPlaying className="mt-3" />

        <HeroContactInfo
          locationLabel={t("locationLabel")}
          location={t("location")}
          emailLabel={t("emailLabel")}
          email={email}
          emailHref={siteConfig.links.email}
        />

        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          <Tagline />
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <a
            href="#experience"
            className="group inline-flex items-center gap-1.5 text-foreground underline decoration-foreground/30 decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {t("primaryCta")}
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
          <a href="#contact" className="text-muted-foreground transition-colors hover:text-foreground">
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
        <span key={chunk || `boundary-${accent}-${parts.length}`}>
          {chunk}
          {i < parts.length - 1 ? <span className="text-foreground">{accent}</span> : null}
        </span>
      ))}
    </>
  );
}
