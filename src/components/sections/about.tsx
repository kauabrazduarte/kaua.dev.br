import { useTranslations } from "next-intl";
import { Section } from "@/components/section";

export function AboutSection() {
  const t = useTranslations("about");

  return (
    <Section id="about" kicker={t("kicker")} title={t("title")}>
      <div className="space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        <p>{t("p1")}</p>
        <p>{t("p3")}</p>
        <p className="text-foreground/80">{t("p4")}</p>
      </div>
    </Section>
  );
}
