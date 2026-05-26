# kauadev.br

Portfólio pessoal do **Kauã Braz Duarte** — desenvolvedor full-stack.

Construído com **Next.js 16 (App Router)**, **Bun**, **Tailwind CSS v4**, **shadcn/ui**,
**next-intl** (pt/en) e **next-themes** (light/dark).

- **Tema light** focado em **amber**
- **Tema dark** focado em **violet**
- Ícones gerais inline no estilo do [itshover.com](https://www.itshover.com/icons)
- Ícones de tecnologia via [`developer-icons`](https://www.npmjs.com/package/developer-icons)
- SEO completo: metadata API, sitemap, robots, manifest, OG dinâmico (edge), JSON-LD Person

## Scripts

```bash
bun install   # instala deps
bun dev       # servidor de desenvolvimento
bun run build # build de produção
bun start     # servidor de produção
```

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Nome, links sociais, GitHub user | `src/lib/site.ts` |
| Textos PT | `messages/pt.json` |
| Textos EN | `messages/en.json` |
| Tema (amber/violet) | `src/app/globals.css` |
| Projetos (placeholders) | `src/components/sections/projects.tsx` |
| Experiência (timeline) | `src/components/sections/experience.tsx` |
| Skills / Stack | `src/components/sections/skills.tsx` |

## Estrutura

```
src/
├── app/
│   ├── [locale]/        # rotas localizadas (pt, en)
│   ├── globals.css      # tokens de tema (amber/violet)
│   ├── icon.tsx         # favicon dinâmico (edge)
│   ├── opengraph-image.tsx
│   ├── manifest.ts
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── sections/        # Hero, About, Skills, Projects, Experience, Stats, Contact
│   ├── ui/              # shadcn primitives
│   └── *.tsx            # header, footer, theme toggle, language toggle
├── i18n/                # routing + request config (next-intl)
└── lib/
    ├── site.ts          # config central
    └── utils.ts         # cn()
```

## Deploy

Otimizado para Vercel ou qualquer runtime Node 20+ / Bun.
Antes do deploy, atualize `siteConfig.url` em `src/lib/site.ts`.
