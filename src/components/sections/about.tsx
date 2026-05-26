import { useMessages, useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { AgeCounter } from "@/components/age-counter";
import { getAge } from "@/lib/age";
import { interpolate } from "@/lib/interpolate";
import { siteConfig } from "@/lib/site";

export function AboutSection() {
  const t = useTranslations("about");
  // Pull the raw template so we can interpolate the AgeCounter without
  // crossing the RSC boundary with a callback.
  const messages = useMessages() as { about: { p1: string } };
  const p1Raw = messages.about.p1;

  const initialAge = getAge(siteConfig.birth);

  return (
    <Section id="about" kicker={t("kicker")} title={t("title")}>
      <div className="space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        <p>
          {interpolate(p1Raw, {
            age: <AgeCounter birth={siteConfig.birth} fallback={initialAge} />,
          })}
        </p>
        <p>{t("p3")}</p>
        <p className="text-foreground/80">{t("p4")}</p>
      </div>
    </Section>
  );
}
