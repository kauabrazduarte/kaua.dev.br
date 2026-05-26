import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/section";

interface Experience {
  company: string;
  aka?: string;
  url?: string;
  role: { pt: string; en: string };
  period: { pt: string; en: string };
  current?: boolean;
  highlights: { pt: string; en: string }[];
  tags: string[];
}

const EXPERIENCES: Experience[] = [
  {
    company: "Marcos Jocober",
    aka: "The Deed Hunter",
    url: "https://marcosjocober.com",
    role: { pt: "Desenvolvedor Full-Stack", en: "Full-Stack Developer" },
    period: { pt: "2025 — Atual", en: "2025 — Present" },
    current: true,
    highlights: [
      {
        pt: "Foco em automações de processos com integrações de IA e APIs.",
        en: "Focused on process automation with AI integrations and APIs.",
      },
      {
        pt: "Construção e manutenção de ferramentas internas em Next.js e Bun.",
        en: "Building and maintaining internal tools in Next.js and Bun.",
      },
    ],
    tags: [
      "Bun",
      "Node.js",
      "TypeScript",
      "Next.js",
      "Claude Code",
      "VPS",
      "MacMini (OpenClaw)",
      "Dokploy",
    ],
  },
  {
    company: "PrecoCerto",
    url: "https://precocerto.com",
    role: {
      pt: "Desenvolvedor Web",
      en: "Web Developer",
    },
    period: { pt: "2025 — Atual", en: "2025 — Present" },
    current: true,
    highlights: [
      {
        pt: "Desenvolvimento e manutenção do website em produção.",
        en: "Development and maintenance of the production website.",
      },
    ],
    tags: [
      "Next.js",
      "TypeScript",
      "Tailwind",
      "Claude Code",
      "VPS",
      "Easypanel",
    ],
  },
  {
    company: "Workana",
    url: "https://www.workana.com",
    role: { pt: "Freelancer · Full-Stack", en: "Freelancer · Full-Stack" },
    period: { pt: "2020 — 2025", en: "2020 — 2025" },
    highlights: [
      {
        pt: "Mais de 500 projetos entregues — aplicações web, automações e integrações de API.",
        en: "500+ projects delivered — web apps, automations and API integrations.",
      },
      {
        pt: "Atendimento direto a clientes do Brasil e LATAM, com foco em prazo e qualidade.",
        en: "Direct work with clients across Brazil and LATAM, with a focus on deadlines and quality.",
      },
    ],
    tags: ["React", "Node.js", "PHP", "PostgreSQL", "Astro"],
  },
];

export function ExperienceSection() {
  const t = useTranslations("experience");
  const locale = useLocale() as "pt" | "en";

  return (
    <Section
      id="experience"
      kicker={t("kicker")}
      title={t("title")}
      subtitle={t("subtitle")}
    >
      <ol className="space-y-7">
        {EXPERIENCES.map((exp) => (
          <li
            key={`${exp.company}-${exp.period.en}`}
            className="grid gap-2 sm:grid-cols-[120px_1fr] sm:gap-6"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:pt-[3px]">
              {exp.period[locale]}
              {exp.current ? (
                <span className="ml-2 inline-flex items-center gap-1 normal-case tracking-normal text-success">
                  <span aria-hidden className="h-1 w-1 rounded-full bg-success" />
                  {t("present")}
                </span>
              ) : null}
            </div>
            <div>
              <p className="text-sm text-foreground">
                <span className="font-mono font-medium">{exp.company}</span>
                {exp.aka ? (
                  <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                    ({exp.aka})
                  </span>
                ) : null}
                <span className="mx-2 text-muted-foreground/50">·</span>
                <span className="text-muted-foreground">{exp.role[locale]}</span>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {exp.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span
                      aria-hidden
                      className="mt-2.5 h-px w-2.5 shrink-0 bg-muted-foreground/40"
                    />
                    <span>{h[locale]}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground/80">
                {exp.tags.join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
