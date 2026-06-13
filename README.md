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

## Presença ao vivo ("coding now")

O dot verde no Hero mostra **"coding right now"** quando estou programando e
**"open to chat"** quando não estou. Funciona por _heartbeat_:

- Meu computador faz `POST /api/presence` com um token secreto → grava uma chave
  no Redis com **TTL de 30 min**.
- O site lê `GET /api/presence`; enquanto a chave existir, mostra "coding now".
  Parou de mandar heartbeat? A chave expira sozinha e volta pra "open to chat".

O token e a URL ficam em `.claude/presence.local.json` (gitignored):

```json
{ "url": "https://kaua.dev.br/api/presence", "token": "..." }
```

**Dois gatilhos** disparam o heartbeat (independentes, podem coexistir):

| Gatilho | Arquivo | Dispara quando |
| --- | --- | --- |
| Processos abertos | `scripts/presence-process-watch.ps1` | Warp / Zed / Riggr está aberto (checado a cada 10 min via Task Scheduler) |
| Prompt no Claude Code | `scripts/presence-heartbeat.ps1` | Mando um prompt (hook `UserPromptSubmit` em `.claude/settings.local.json`) |

### Ativar (gatilho por processos)

Roda **uma vez** no PowerShell (como Administrador se der "Acesso negado"):

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\kauac\Meu Pessoal\Projetos Pessoais\kauadevbr\scripts\register-presence-task.ps1"
```

Registra a tarefa agendada `kaua-dev-presence` (roda a cada 10 min, sobrevive a reboot).

### Desativar

```powershell
Unregister-ScheduledTask -TaskName 'kaua-dev-presence' -Confirm:$false
```

Pra desligar o gatilho do Claude Code, remova o bloco `UserPromptSubmit` de
`.claude/settings.local.json`.

### Ajustar quais apps contam

Edite a lista `$targets` em `scripts/presence-process-watch.ps1` (match por
substring no nome do processo, sem precisar do nome exato do .exe):

```powershell
$targets = @('warp', 'zed', 'rigg')
```

Pra descobrir o nome de um processo: `Get-Process | Select ProcessName -Unique`.

> Os scripts `.ps1` devem conter **apenas caracteres ASCII** — o PowerShell 5.1
> lê acentos/travessões errado e quebra o parser.

## Deploy

Otimizado para Vercel ou qualquer runtime Node 20+ / Bun.
Antes do deploy, atualize `siteConfig.url` em `src/lib/site.ts`.
