export const siteConfig = {
  name: "Kauã Braz Duarte",
  shortName: "Kauã",
  handle: "@kauadevbr",
  url: "https://kaua.dev.br",
  birth: "2006-05-10", // used by `getAge()`; the date itself is never shown
  description: {
    pt: "Desenvolvedor Full-Stack focado em aplicações web e automações com IA. Trabalho com Bun, Node.js, TypeScript, React, Next.js e Astro.",
    en: "Full-Stack Developer focused on web apps and AI automation. I work with Bun, Node.js, TypeScript, React, Next.js and Astro.",
  },
  keywords: [
    "Kauã Braz Duarte",
    "kauadevbr",
    "kauabrazduarte",
    "Desenvolvedor Full-Stack",
    "Full-Stack Developer",
    "Bun Developer",
    "Next.js",
    "TypeScript",
    "React",
    "Astro",
    "Node.js",
    "Deno",
    "PHP",
    "Python",
    "Prisma",
    "Supabase",
    "Docker",
    "Vercel",
    "AI Automation",
    "Automações com IA",
    "Claude Code",
    "Codex",
    "Anthropic",
    "Freelancer Workana",
    "PrecoCerto",
    "Marcos Jocober",
    "The Deed Hunter",
    "Portfolio",
  ],
  links: {
    github: "https://github.com/kauabrazduarte",
    email: "mailto:contato@kaua.dev.br",
    x: "https://x.com/kauadevbr",
  },
  github: {
    username: "kauabrazduarte",
    // Avatar is bundled in /public so we don't depend on GitHub at request
    // time (faster Hero, deterministic OG image). Refresh with:
    //   curl -L https://github.com/kauabrazduarte.png -o public/avatar.png
    avatar: "/avatar.png",
  },
  workplaces: [
    { name: "Marcos Jocober", aka: "The Deed Hunter" },
    { name: "PrecoCerto", aka: null },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
