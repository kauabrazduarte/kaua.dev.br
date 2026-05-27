import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/section";
import type { Locale } from "@/i18n/routing";

type L10n = Record<Locale, string>;

interface Experience {
  company: string;
  aka?: string;
  url?: string;
  role: L10n;
  period: L10n;
  current?: boolean;
  highlights: L10n[];
  tags: string[];
}

const EXPERIENCES: Experience[] = [
  {
    company: "Marcos Jocober",
    aka: "The Deed Hunter",
    url: "https://marcosjocober.com",
    role: {
      pt: "Desenvolvedor Full-Stack",
      en: "Full-Stack Developer",
      es: "Desarrollador Full-Stack",
      zh: "全栈开发者",
    },
    period: {
      pt: "2026 — Atual",
      en: "2026 — Present",
      es: "2026 — Actual",
      zh: "2026 — 至今",
    },
    current: true,
    highlights: [
      {
        pt: "Foco em automações de processos com integrações de IA e APIs.",
        en: "Focused on process automation with AI integrations and APIs.",
        es: "Enfoque en automatización de procesos con integraciones de IA y APIs.",
        zh: "专注于通过 AI 和 API 集成实现流程自动化。",
      },
      {
        pt: "Construção e manutenção de ferramentas internas em Next.js e Bun.",
        en: "Building and maintaining internal tools in Next.js and Bun.",
        es: "Construcción y mantenimiento de herramientas internas en Next.js y Bun.",
        zh: "构建和维护基于 Next.js 和 Bun 的内部工具。",
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
      es: "Desarrollador Web",
      zh: "Web 开发者",
    },
    period: {
      pt: "2026 — Atual",
      en: "2026 — Present",
      es: "2026 — Actual",
      zh: "2026 — 至今",
    },
    current: true,
    highlights: [
      {
        pt: "Manutenção do website em produção.",
        en: "Maintenance of the production website.",
        es: "Mantenimiento del sitio web en producción.",
        zh: "维护生产环境的网站。",
      },
      {
        pt: "Criando novas features.",
        en: "Building new features.",
        es: "Creando nuevas funcionalidades.",
        zh: "开发新功能。",
      },
      {
        pt: "Criação do sistema completo.",
        en: "Built the entire system.",
        es: "Creación del sistema completo.",
        zh: "搭建完整的系统。",
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
    role: {
      pt: "Freelancer · Full-Stack",
      en: "Freelancer · Full-Stack",
      es: "Freelancer · Full-Stack",
      zh: "自由职业 · 全栈",
    },
    period: {
      pt: "2020 — 2025",
      en: "2020 — 2025",
      es: "2020 — 2025",
      zh: "2020 — 2025",
    },
    highlights: [
      {
        pt: "Mais de 500 projetos entregues — aplicações web, automações e integrações de API.",
        en: "500+ projects delivered — web apps, automations and API integrations.",
        es: "Más de 500 proyectos entregados — aplicaciones web, automatizaciones e integraciones de API.",
        zh: "交付超过 500 个项目——Web 应用、自动化和 API 集成。",
      },
      {
        pt: "Atendimento direto a clientes do Brasil e LATAM, com foco em prazo e qualidade.",
        en: "Direct work with clients across Brazil and LATAM, with a focus on deadlines and quality.",
        es: "Trabajo directo con clientes de Brasil y LATAM, con foco en plazos y calidad.",
        zh: "直接服务巴西和拉美客户，注重交付时间和质量。",
      },
    ],
    tags: ["React", "Node.js", "PHP", "PostgreSQL", "Astro"],
  },
];

export function ExperienceSection() {
  const t = useTranslations("experience");
  const locale = useLocale() as Locale;

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
