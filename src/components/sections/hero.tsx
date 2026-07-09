import { useTranslations } from "next-intl";
import { siteConfig } from "@/lib/site";
import { ThemedCatLottie } from "@/components/themed-cat-lottie";
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
      <div className="mx-auto w-full max-w-2xl px-6 pb-12 pt-14 sm:pb-16 sm:pt-20">
        {/* Live presence — pulsing green while I'm working in Claude Code,
            muted "open to chat" otherwise. Driven by /api/presence. */}
        <PresenceStatus />

        <div className="mt-6 flex items-center gap-4">
          <AvatarLightbox
            src={siteConfig.github.avatar}
            alt={siteConfig.name}
            size={56}
            thumbClassName="size-12"
            priority
          />
          <div className="min-w-0 leading-snug">
            <h1 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
              {siteConfig.name}
            </h1>
            {/* Role labels roll through every few seconds via slot-text. */}
            <div className="mt-0.5">
              <RotatingRoles phrases={roles} />
            </div>
          </div>
        </div>

        {/* Sits below the avatar block so it always has full width — keeps
            mobile from breaking when track titles are long. */}
        <NowPlaying className="mt-3" />

        {/* Location + email, each with its own hover-animated icon. */}
        <HeroContactInfo
          locationLabel={t("locationLabel")}
          location={t("location")}
          emailLabel={t("emailLabel")}
          email={email}
          emailHref={siteConfig.links.email}
        />

        <div className="mt-6 grid items-center gap-6 sm:grid-cols-[1fr_0.5fr] sm:gap-4">
          <div className="min-w-0">
            <p className="text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              <Tagline />
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <a
                href="#experience"
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

          <div className="order-first mx-auto w-full max-w-[180px] sm:order-none sm:max-w-none">
            <ThemedCatLottie className="w-full" />
          </div>
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
          {i < parts.length - 1 ? (
            <span className="text-foreground">{accent}</span>
          ) : null}
        </span>
      ))}
    </>
  );
}
