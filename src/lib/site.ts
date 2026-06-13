export const siteConfig = {
  name: "Kauã Braz Duarte",
  shortName: "Kauã",
  handle: "@kauadevbr",
  url: "https://kaua.dev.br",
  birth: "2006-05-10", // used by `getAge()`; the date itself is never shown
  description: {
    pt: "Desenvolvedor Full-Stack focado em aplicações web e automações com IA. Trabalho com Bun, Node.js, TypeScript, React, Next.js e Astro.",
    en: "Full-Stack Developer focused on web apps and AI automation. I work with Bun, Node.js, TypeScript, React, Next.js and Astro.",
    es: "Desarrollador Full-Stack enfocado en aplicaciones web y automatización con IA. Trabajo con Bun, Node.js, TypeScript, React, Next.js y Astro.",
    zh: "全栈开发者，专注于 Web 应用和 AI 自动化。使用 Bun、Node.js、TypeScript、React、Next.js 和 Astro。",
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
    buymeacoffee: "https://buymeacoffee.com/kauabrazduarte",
  },
  // Pix (Brazilian instant payment). `payload` is the full BR Code / EMV
  // "copia e cola" string — it's what the QR on /pix encodes. `key` is the raw
  // Pix key (CNPJ) for the "copy key" action. Both are public, receive-only.
  pix: {
    key: "65661240000182",
    payload:
      "00020126360014BR.GOV.BCB.PIX0114656612400001825204000053039865802BR592565.661.240 KAUA BRAZ DUAR6009SAO PAULO62140510Jgwq99ltBg63047C01",
    city: "Minas Gerais",
    // Nubank "cobrar" page — opens the payment directly in the bank/app flow.
    nubankUrl:
      "https://nubank.com.br/cobrar/78w9ww/6a2d8ff1-bf39-45f3-b616-5f3a7527b669",
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
