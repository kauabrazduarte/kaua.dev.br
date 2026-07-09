import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { SocialIcon } from "@/components/social-icon";
import { siteConfig } from "@/lib/site";

export function ContactSection() {
  const t = useTranslations("contact");

  return (
    <Section
      id="contact"
      kicker={t("kicker")}
      title={t("title")}
      subtitle={t("subtitle")}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-foreground">
          <a
            href={siteConfig.links.email}
            className="font-mono underline decoration-foreground/30 decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {siteConfig.links.email.replace("mailto:", "")}
          </a>
          <span className="ml-3 text-muted-foreground">
            {t("or")}{" "}
            <a
              href={siteConfig.links.x}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-foreground transition-colors hover:text-primary"
            >
              {siteConfig.handle}
            </a>
          </span>
        </p>
        <div className="-mx-1.5 flex items-center">
          <SocialIcon
            href={siteConfig.links.github}
            label="GitHub"
            kind="github"
          />
          <SocialIcon href={siteConfig.links.x} label="X" kind="x" />
          <SocialIcon href={siteConfig.links.email} label="Email" kind="email" />
          <SocialIcon href={siteConfig.links.whatsapp} label="WhatsApp" kind="whatsapp" />
        </div>
      </div>
    </Section>
  );
}
