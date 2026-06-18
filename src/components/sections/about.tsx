import { useTranslations } from "next-intl";
import { Section } from "@/components/section";

export function AboutSection() {
  const t = useTranslations("about");

  return (
    <Section id="about" kicker={t("kicker")} title={t("title")}>
      <div className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        <p>{t("body")}</p>
      </div>
    </Section>
  );
}
