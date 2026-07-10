import { z } from "zod/v4";
import { tool } from "ai";
import { siteConfig } from "@/lib/site";

// ─────────────────────────────────────────────
// Schemas (shared between server + client)
// ─────────────────────────────────────────────

const themeSchema = z.object({
  theme: z
    .enum(["light", "dark"])
    .describe("Theme to apply: 'light' or 'dark'"),
});

const toggleThemeSchema = z.object({});

const fireworksSchema = z.object({
  intensity: z
    .enum(["small", "medium", "big"])
    .default("medium")
    .describe("Burst intensity"),
});

const confettiSchema = z.object({
  count: z
    .number()
    .min(10)
    .max(200)
    .default(80)
    .describe("Number of confetti particles"),
});

const scrollToSchema = z.object({
  section: z
    .enum(["top", "about", "skills", "experience", "github", "contact"])
    .describe("Section ID to scroll to"),
});

const openLinkSchema = z.object({
  destination: z
    .enum(["github", "x", "email", "whatsapp", "buymeacoffee", "pix", "links"])
    .describe("Which link to open"),
});

const changeLanguageSchema = z.object({
  locale: z
    .enum(["pt", "en", "es", "zh"])
    .describe("Language locale code"),
});

const showToastSchema = z.object({
  message: z.string().max(120).describe("Toast message text"),
});

const pulseElementSchema = z.object({
  target: z
    .enum(["avatar", "cat", "header"])
    .describe("Element to pulse"),
});

const highlightSectionSchema = z.object({
  section: z
    .enum(["about", "skills", "experience", "github", "contact"])
    .describe("Section to highlight"),
});

const copyTextSchema = z.object({
  text: z.string().max(500).describe("Text to copy to clipboard"),
});

const earthquakeSchema = z.object({
  duration: z
    .number()
    .min(500)
    .max(5000)
    .default(2000)
    .describe("Shake duration in milliseconds"),
});

const invertColorsSchema = z.object({
  duration: z
    .number()
    .min(1000)
    .max(10000)
    .default(3000)
    .describe("Inversion duration in milliseconds"),
});

const setChatWidthSchema = z.object({
  width: z
    .number()
    .min(320)
    .max(700)
    .describe("Chat panel width in pixels (desktop only)"),
});

const triggerPresenceSchema = z.object({
  state: z
    .enum(["online", "offline"])
    .describe("Fake presence state"),
});

const balloonPhraseSchema = z.object({
  phrase: z
    .string()
    .max(60)
    .describe("Custom phrase to show in the cat balloon"),
});

const shakeCatSchema = z.object({});

const rocketConfettiSchema = z.object({
  count: z
    .number()
    .min(1)
    .max(10)
    .default(4)
    .describe("Number of rocket launches"),
});

const hideBalloonSchema = z.object({
  seconds: z
    .number()
    .min(1)
    .max(60)
    .default(10)
    .describe("Seconds to hide the balloon"),
});

const glowAvatarSchema = z.object({
  color: z
    .string()
    .max(20)
    .default("amber")
    .describe("Glow color name or hex"),
});

const jumpToCatSchema = z.object({});

// ─────────────────────────────────────────────
// Tool definitions (server-side)
// ─────────────────────────────────────────────

const ok = (msg: string) => ({ ok: true, message: msg });

const DEFS = {
  set_theme: tool({
    description:
      "Altera o tema visual do site para claro ou escuro. Use quando o visitante pedir para mudar as cores.",
    inputSchema: themeSchema,
    execute: async ({ theme }) =>
      ok(`Tema alterado para ${theme === "dark" ? "escuro" : "claro"}.`),
  }),

  toggle_theme: tool({
    description:
      "Alterna entre tema claro e escuro. Use quando o visitante disser 'muda o tema' sem especificar qual.",
    inputSchema: toggleThemeSchema,
    execute: async () => ok("Tema alternado."),
  }),

  fireworks: tool({
    description:
      "Dispara uma rajada de fogos de artifício no site. Use quando o visitante pedir comemoração, fogos, ou disser 'party'.",
    inputSchema: fireworksSchema,
    execute: async ({ intensity }) =>
      ok(`Rajada de fogos (${intensity}) disparada.`),
  }),

  confetti_rain: tool({
    description:
      "Chove confete colorido de cima para baixo. Use quando alguém pedir confete ou celebrating.",
    inputSchema: confettiSchema,
    execute: async ({ count }) =>
      ok(`Chuva de ${count} confetes disparada.`),
  }),

  rocket_confetti: tool({
    description:
      "Lança foguetes de confete de baixo para cima, como em um show. Use quando o visitante pedir foguetes ou um 'show'.",
    inputSchema: rocketConfettiSchema,
    execute: async ({ count }) =>
      ok(`${count} foguetes de confete lançados.`),
  }),

  scroll_to: tool({
    description:
      "Rola a página até uma seção específica. Seções: top, about, skills, experience, github, contact.",
    inputSchema: scrollToSchema,
    execute: async ({ section }) => ok(`Rolando até a seção "${section}".`),
  }),

  open_link: tool({
    description:
      "Abre um link externo do Kauã em nova aba. Opções: github, x, email, whatsapp, buymeacoffee, pix, links.",
    inputSchema: openLinkSchema,
    execute: async ({ destination }) =>
      ok(`Abrindo link: ${destination}.`),
  }),

  change_language: tool({
    description:
      "Altera o idioma do site. Locais suportados: pt (Português), en (English), es (Español), zh (中文).",
    inputSchema: changeLanguageSchema,
    execute: async ({ locale }) => ok(`Idioma alterado para ${locale}.`),
  }),

  show_toast: tool({
    description:
      "Mostra uma pequena notificação flutuante (toast) no canto da tela com uma mensagem curta.",
    inputSchema: showToastSchema,
    execute: async ({ message }) => ok(`Toast exibido: "${message}"`),
  }),

  pulse_element: tool({
    description:
      "Faz um elemento da página pulsar para chamar atenção. Alvos: avatar, cat, header.",
    inputSchema: pulseElementSchema,
    execute: async ({ target }) =>
      ok(`Pulsando elemento: ${target}.`),
  }),

  highlight_section: tool({
    description:
      "Destaca temporariamente uma seção da página com uma borda colorida. Seções: about, skills, experience, github, contact.",
    inputSchema: highlightSectionSchema,
    execute: async ({ section }) =>
      ok(`Seção "${section}" destacada.`),
  }),

  copy_to_clipboard: tool({
    description:
      "Copia um texto para a área de transferência do visitante. Use quando alguém pedir para copiar um link, e-mail ou chave Pix.",
    inputSchema: copyTextSchema,
    execute: async ({ text }) =>
      ok(`Texto copiado: "${text.slice(0, 40)}${text.length > 40 ? "…" : ""}"`),
  }),

  earthquake: tool({
    description:
      "Faz a página tremer como um terremoto por alguns segundos. Use quando o visitante pedir para 'tremer' algo ou disser 'earthquake'.",
    inputSchema: earthquakeSchema,
    execute: async ({ duration }) =>
      ok(`Terremoto de ${duration}ms disparado.`),
  }),

  invert_colors: tool({
    description:
      "Inverte as cores do site temporariamente. Use quando o visitante pedir 'inverter cores' ou 'negativo'.",
    inputSchema: invertColorsSchema,
    execute: async ({ duration }) =>
      ok(`Cores invertidas por ${duration}ms.`),
  }),

  set_chat_width: tool({
    description:
      "Altera a largura do painel de chat no desktop (320–700px). Use quando o visitante pedir para aumentar/diminuir o chat.",
    inputSchema: setChatWidthSchema,
    execute: async ({ width }) => ok(`Largura do chat: ${width}px.`),
  }),

  trigger_presence: tool({
    description:
      "Simula um estado de presença ('online' ou 'offline') para mostrar como o indicador funciona.",
    inputSchema: triggerPresenceSchema,
    execute: async ({ state }) =>
      ok(`Presença simulada: ${state}.`),
  }),

  balloon_phrase: tool({
    description:
      "Define uma frase personalizada no balão do gato. Use quando o visitante pedir para o gato dizer algo específico.",
    inputSchema: balloonPhraseSchema,
    execute: async ({ phrase }) =>
      ok(`Frase do balão definida: "${phrase}"`),
  }),

  shake_cat: tool({
    description:
      "Faz o gatinho animado sacudir rapidamente. Use quando o visitante pedir para 'acordar' o gato ou dar um 'tremor' nele.",
    inputSchema: shakeCatSchema,
    execute: async () => ok("Gato sacudido."),
  }),

  hide_balloon: tool({
    description:
      "Esconde o balão do gato por alguns segundos. Use quando o visitante pedir para 'calar' o gato temporariamente.",
    inputSchema: hideBalloonSchema,
    execute: async ({ seconds }) =>
      ok(`Balão escondido por ${seconds}s.`),
  }),

  glow_avatar: tool({
    description:
      "Adiciona um brilho temporário ao avatar do Kauã. Use quando o visitante pedir algo 'brilhante' ou 'glow'.",
    inputSchema: glowAvatarSchema,
    execute: async ({ color }) => ok(`Avatar brilhando (${color}).`),
  }),

  jump_to_cat: tool({
    description:
      "Rola a página até o gatinho animado no topo do site, caso o visitante queira vê-lo.",
    inputSchema: jumpToCatSchema,
    execute: async () => ok("Rolando até o gato."),
  }),
} as const;

export type ChatToolSet = typeof DEFS;
export type ChatToolName = keyof ChatToolSet;

export function getChatTools(): ChatToolSet {
  return DEFS;
}

// ─────────────────────────────────────────────
// Client-side action handler
// ─────────────────────────────────────────────

const LINK_MAP: Record<string, string> = {
  github: siteConfig.links.github,
  x: siteConfig.links.x,
  email: siteConfig.links.email,
  whatsapp: siteConfig.links.whatsapp,
  buymeacoffee: siteConfig.links.buymeacoffee,
  pix: "/pix",
  links: "/links",
};

const SECTION_IDS: Record<string, string> = {
  top: "top",
  about: "about",
  skills: "skills",
  experience: "experience",
  github: "github-stats",
  contact: "contact",
};

async function fireConfettiFromOrigin(
  x: number,
  y: number,
  opts: { count?: number; spread?: number; angle?: number; startVelocity?: number } = {},
) {
  const mod = await import("canvas-confetti");
  const confetti = mod.default;
  const palette = () =>
    document.documentElement.classList.contains("dark")
      ? ["#a855f7", "#c084fc", "#7c3aed"]
      : ["#f97316", "#fb923c", "#ea580c"];
  confetti({
    origin: { x, y },
    colors: palette(),
    spread: opts.spread ?? 360,
    particleCount: opts.count ?? 60,
    startVelocity: opts.startVelocity ?? 28,
    gravity: 0.9,
    ticks: 120,
    disableForReducedMotion: true,
  });
}

let toastTimeout: ReturnType<typeof setTimeout> | undefined;
function showToast(message: string) {
  let el = document.getElementById("chat-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "chat-toast";
    el.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      z-index:9999; padding:8px 16px; border-radius:8px;
      background:var(--popover, #fff); color:var(--popover-foreground, #000);
      border:1px solid var(--border); font-size:13px; font-family:monospace;
      box-shadow:0 4px 12px rgba(0,0,0,.15); pointer-events:none;
      opacity:0; transition:opacity .2s ease, transform .2s ease;
    `;
    document.body.appendChild(el);
  }
  el.textContent = message;
  (el as HTMLDivElement).style.opacity = "1";
  (el as HTMLDivElement).style.transform = "translateX(-50%) translateY(0)";
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    if (el) (el as HTMLDivElement).style.opacity = "0";
  }, 4000);
}

function pulseSelector(target: string): string {
  switch (target) {
    case "avatar":
      return 'img[alt="' + siteConfig.name + '"]';
    case "cat":
      return "[role='img'][aria-label='Animated cat illustration']";
    case "header":
      return "header";
    default:
      return "";
  }
}

function pulseElement(target: string) {
  const sel = pulseSelector(target);
  if (!sel) return;
  const el = document.querySelector(sel) as HTMLElement | null;
  if (!el) return;
  el.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.15)" },
      { transform: "scale(1)" },
    ],
    { duration: 600, iterations: 2 },
  );
}

function highlightSection(section: string) {
  const el = document.getElementById(section);
  if (!el) return;
  const old = el.style.outline;
  const oldOff = el.style.outlineOffset;
  el.style.outline = "2px solid var(--primary)";
  el.style.outlineOffset = "6px";
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => {
    el.style.outline = old;
    el.style.outlineOffset = oldOff;
  }, 3000);
}

function triggerEarthquake(duration: number) {
  const body = document.body;
  const start = Date.now();
  function shake() {
    const elapsed = Date.now() - start;
    if (elapsed >= duration) {
      body.style.transform = "";
      return;
    }
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 6;
    body.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(shake);
  }
  shake();
}

function invertColors(duration: number) {
  const root = document.documentElement;
  root.style.setProperty("filter", "invert(1) hue-rotate(180deg)");
  setTimeout(() => root.style.removeProperty("filter"), duration);
}

function glowAvatar(color: string) {
  const el = document.querySelector(
    `img[alt="${siteConfig.name}"]`,
  ) as HTMLElement | null;
  if (!el) return;
  const glow = color.startsWith("#") ? color : `var(--primary)`;
  const oldShadow = el.style.boxShadow;
  el.style.boxShadow = `0 0 16px 4px ${glow}`;
  el.style.borderRadius = "50%";
  setTimeout(() => {
    el.style.boxShadow = oldShadow;
  }, 3000);
}

function shakeCat() {
  const el = document.querySelector(
    "[role='img'][aria-label='Animated cat illustration']",
  ) as HTMLElement | null;
  if (!el) return;
  el.animate(
    [
      { transform: "translateX(0) rotate(0)" },
      { transform: "translateX(-4px) rotate(-2deg)" },
      { transform: "translateX(4px) rotate(2deg)" },
      { transform: "translateX(-3px) rotate(-1deg)" },
      { transform: "translateX(3px) rotate(1deg)" },
      { transform: "translateX(0) rotate(0)" },
    ],
    { duration: 400, iterations: 3 },
  );
}

function setGlobalKV(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(`chat:${key}`, { detail: value }));
}

/**
 * Client-side dispatcher for tool results returned by the assistant.
 * Called for each completed tool invocation in the message stream.
 */
export function dispatchChatToolResult(
  toolName: string,
  input: unknown,
): void {
  const args = (input ?? {}) as Record<string, unknown>;
  const win = window as unknown as { __chatSetWidth?: (w: number) => void };

  switch (toolName) {
    case "set_theme":
    case "toggle_theme": {
      const isDark =
        document.documentElement.classList.contains("dark");
      if (toolName === "toggle_theme") {
        document.documentElement.classList.toggle("dark", !isDark);
      } else {
        const theme = String(args.theme ?? "light");
        document.documentElement.classList.toggle("dark", theme === "dark");
      }
      break;
    }
    case "fireworks": {
      const intensity = String(args.intensity ?? "medium");
      const counts = { small: 40, medium: 80, big: 140 };
      fireConfettiFromOrigin(0.5, 0.5, {
        count: counts[intensity as keyof typeof counts] ?? 80,
        spread: 360,
        startVelocity: 35,
      });
      break;
    }
    case "confetti_rain": {
      const count = Number(args.count ?? 80);
      import("canvas-confetti").then((m) => {
        m.default({
          particleCount: count,
          spread: 90,
          startVelocity: -10,
          origin: { y: 0 },
          gravity: 1.2,
          disableForReducedMotion: true,
        });
      });
      break;
    }
    case "rocket_confetti": {
      const launches = Number(args.count ?? 4);
      import("canvas-confetti").then((m) => {
        for (let i = 0; i < launches; i++) {
          const x = 0.15 + (i / (launches - 1 || 1)) * 0.7;
          setTimeout(() => {
            m.default({
              origin: { x, y: 1 },
              angle: 90,
              spread: 70,
              startVelocity: 65,
              particleCount: 50,
              gravity: 1.1,
              ticks: 220,
              disableForReducedMotion: true,
            });
          }, i * 120);
        }
      });
      break;
    }
    case "scroll_to": {
      const section = String(args.section ?? "top");
      const id = SECTION_IDS[section] ?? section;
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      break;
    }
    case "open_link": {
      const dest = String(args.destination ?? "github");
      const url = LINK_MAP[dest] ?? siteConfig.links.github;
      window.open(url, "_blank", "noopener,noreferrer");
      break;
    }
    case "change_language": {
      const locale = String(args.locale ?? "pt");
      const path = `/${locale}${location.pathname.replace(/^\/(pt|en|es|zh)/, "")}`;
      window.location.href = path;
      break;
    }
    case "show_toast": {
      showToast(String(args.message ?? ""));
      break;
    }
    case "pulse_element": {
      pulseElement(String(args.target ?? ""));
      break;
    }
    case "highlight_section": {
      const section = String(args.section ?? "about");
      highlightSection(SECTION_IDS[section] ?? section);
      break;
    }
    case "copy_to_clipboard": {
      const text = String(args.text ?? "");
      navigator.clipboard?.writeText(text).catch(() => {});
      break;
    }
    case "earthquake": {
      triggerEarthquake(Number(args.duration ?? 2000));
      break;
    }
    case "invert_colors": {
      invertColors(Number(args.duration ?? 3000));
      break;
    }
    case "set_chat_width": {
      const w = Number(args.width ?? 400);
      win.__chatSetWidth?.(w);
      break;
    }
    case "trigger_presence": {
      const state = String(args.state ?? "online");
      setGlobalKV("presence", state);
      break;
    }
    case "balloon_phrase": {
      const phrase = String(args.phrase ?? "");
      setGlobalKV("balloon-phrase", phrase);
      break;
    }
    case "shake_cat": {
      shakeCat();
      break;
    }
    case "hide_balloon": {
      const seconds = Number(args.seconds ?? 10);
      setGlobalKV("balloon-hidden", "1");
      setTimeout(() => setGlobalKV("balloon-hidden", "0"), seconds * 1000);
      break;
    }
    case "glow_avatar": {
      glowAvatar(String(args.color ?? "amber"));
      break;
    }
    case "jump_to_cat": {
      document.getElementById("top")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      break;
    }
  }
}