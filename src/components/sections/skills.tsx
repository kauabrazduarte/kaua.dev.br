import { useTranslations } from "next-intl";
import {
  React as ReactIcon,
  NextJs,
  TypeScript,
  JavaScript,
  TailwindCSS,
  NodeJs,
  BunJs,
  Deno,
  Astro,
  PHP,
  Python,
  PostgreSQL,
  Prisma,
  Supabase,
  Docker,
  VercelDark,
  Git,
  GitHubDark,
  Figma,
  AnthropicBasicLight,
  AnthropicBasicDark,
  OpenAI,
  ShadcnUI,
  Linux,
  Electron,
} from "developer-icons";
import { Section } from "@/components/section";

type Category = "languages" | "frontend" | "backend" | "devops" | "ai";

interface Skill {
  name: string;
  category: Category;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  DarkIcon?: React.ComponentType<{ size?: number; className?: string }>;
  // Override the icon's brand colors with the foreground color so it
  // inverts with the theme. "fill" works for solid marks (Claude, OpenAI,
  // Vercel, GitHub); "stroke" for outline marks (Shadcn).
  tint?: "fill" | "stroke";
  // CSS-invert the icon in dark mode. Use when the icon has internal detail
  // (gradients, multi-color paths) that a flat tint would erase — e.g.
  // Next.js, where the "N" is a gradient over a solid circle.
  invert?: boolean;
}

const SKILLS: Skill[] = [
  { name: "TypeScript", category: "languages", Icon: TypeScript },
  { name: "JavaScript", category: "languages", Icon: JavaScript },
  { name: "PHP", category: "languages", Icon: PHP },
  { name: "Python", category: "languages", Icon: Python },

  { name: "React", category: "frontend", Icon: ReactIcon },
  { name: "Next.js", category: "frontend", Icon: NextJs, invert: true },
  { name: "Astro", category: "frontend", Icon: Astro },
  { name: "Tailwind", category: "frontend", Icon: TailwindCSS },
  { name: "Shadcn", category: "frontend", Icon: ShadcnUI, tint: "stroke" },

  { name: "Bun", category: "backend", Icon: BunJs },
  { name: "Node.js", category: "backend", Icon: NodeJs },
  { name: "Deno", category: "backend", Icon: Deno },
  { name: "Electron", category: "backend", Icon: Electron },
  { name: "Prisma", category: "backend", Icon: Prisma },
  { name: "Supabase", category: "backend", Icon: Supabase },
  { name: "PostgreSQL", category: "backend", Icon: PostgreSQL },

  { name: "Docker", category: "devops", Icon: Docker },
  { name: "Vercel", category: "devops", Icon: VercelDark, tint: "fill" },
  { name: "Git", category: "devops", Icon: Git },
  { name: "GitHub", category: "devops", Icon: GitHubDark, tint: "fill" },
  { name: "Linux", category: "devops", Icon: Linux },

  { name: "Claude", category: "ai", Icon: AnthropicBasicLight, DarkIcon: AnthropicBasicDark, tint: "fill" },
  { name: "Codex", category: "ai", Icon: OpenAI, tint: "fill" },
  { name: "Figma", category: "ai", Icon: Figma },
];

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
