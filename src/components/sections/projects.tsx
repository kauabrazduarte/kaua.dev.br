import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Section } from "@/components/section";
import { siteConfig } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

// TODO(kauã): substitua os placeholders pelos seus projetos reais.
// `cover` aceita um caminho dentro de /public (ex.: /projects/foo.png)
// ou null para mostrar um placeholder limpo (só com o slug).
interface Project {
  slug: string;
  title: string;
  // `en` is the fallback whenever a translation for the active locale is missing.
  description: Partial<Record<Locale, string>> & { en: string };
  stack: string[];
  cover?: string | null;
  repo?: string;
  live?: string;
}

const PROJECTS: Project[] = [
  {
    slug: "project-one",
    title: "PROJECT_ONE",
    description: {
      pt: "Descrição curta. Explique o problema, sua solução e o resultado em uma linha.",
      en: "Short description. Explain the problem, your solution and the outcome in one line.",
    },
    stack: ["Next.js", "TypeScript", "PostgreSQL"],
    cover: null,
    repo: "https://github.com/kauabrazduarte/PROJECT_ONE",
    live: "https://example.com",
  },
  {
    slug: "project-two",
    title: "PROJECT_TWO",
    description: {
      pt: "Outro projeto — troque por algo do seu portfólio real.",
      en: "Another project — replace with something from your real portfolio.",
    },
    stack: ["React", "Node.js", "Redis"],
    cover: null,
    repo: "https://github.com/kauabrazduarte/PROJECT_TWO",
  },
  {
    slug: "project-three",
    title: "PROJECT_THREE",
    description: {
      pt: "Adicione 3 ou 4 projetos que melhor representem você.",
      en: "Add 3 or 4 projects that best represent you.",
    },
    stack: ["Bun", "Prisma", "Tailwind"],
    cover: null,
    repo: "https://github.com/kauabrazduarte/PROJECT_THREE",
    live: "https://example.com",
  },
];

export function ProjectsSection() {
  const t = useTranslations("projects");
  const locale = useLocale() as Locale;

  return (
    <Section
      id="projects"
      kicker={t("kicker")}
      title={t("title")}
      subtitle={t("subtitle")}
    >
      <ul className="-mx-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
        {PROJECTS.map((p) => (
          <li key={p.slug}>
            <a
              href={p.live ?? p.repo ?? "#"}
              target={p.live || p.repo ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group block px-2"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
                {p.cover ? (
                  <Image
                    src={p.cover}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                      {p.slug}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <h3 className="font-mono text-sm font-medium text-foreground">
                  {p.title}
                </h3>
                <span
                  aria-hidden
                  className="inline-block text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                >
                  ↗
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {p.description[locale] ?? p.description.en}
              </p>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground/80">
                {p.stack.join(" · ")}
              </p>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-end">
        <a
          href={siteConfig.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("viewAll")}
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            ↗
          </span>
        </a>
      </div>
    </Section>
  );
}
