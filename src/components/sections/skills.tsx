import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { SKILLS, type Category } from "@/components/sections/skills-data";

const ORDER: Category[] = ["languages", "frontend", "backend", "devops", "ai"];

export function SkillsSection() {
  const t = useTranslations("skills");

  return (
    <Section
      id="skills"
      kicker={t("kicker")}
      title={t("title")}
      subtitle={t("subtitle")}
    >
      <dl className="grid gap-3 sm:grid-cols-[120px_1fr]">
        {ORDER.map((cat) => {
          const items = SKILLS.filter((s) => s.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="contents">
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:pt-[3px]">
                {t(`categories.${cat}`)}
              </dt>
              <dd className="-mt-1 mb-2 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mb-0 sm:mt-0">
                {items.map(({ name, Icon, DarkIcon, tint, invert }) => {
                  // Tinted icons inherit the theme's foreground color so the
                  // mark inverts with the theme (dark in light mode, near-white
                  // in dark mode). "fill" repaints solid marks; "stroke" recolors
                  // outline marks like Shadcn.
                  const tintClass =
                    tint === "fill"
                      ? "text-foreground/85 [&_path]:!fill-current [&_rect]:!fill-current"
                      : tint === "stroke"
                        ? "text-foreground/85 [&_path]:!stroke-current [&_g]:!stroke-current"
                        : "";
                  // invert: CSS-flip the icon in dark mode while preserving
                  // internal detail (gradients) that a tint would flatten.
                  const invertClass = invert ? "dark:invert" : "";
                  const wrapperClass = `inline-flex size-4 items-center justify-center ${tintClass} ${invertClass}`;
                  return (
                    <span
                      key={name}
                      className="hover-lift inline-flex cursor-pointer items-center gap-1.5 text-sm text-foreground"
                    >
                      <span aria-hidden className={wrapperClass}>
                        {DarkIcon ? (
                          <>
                            <span className="dark:hidden">
                              <Icon size={16} />
                            </span>
                            <span className="hidden dark:inline">
                              <DarkIcon size={16} />
                            </span>
                          </>
                        ) : (
                          <Icon size={16} />
                        )}
                      </span>
                      {name}
                    </span>
                  );
                })}
              </dd>
            </div>
          );
        })}
      </dl>
    </Section>
  );
}
