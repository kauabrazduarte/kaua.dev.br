import type { ComponentType } from "react";
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
import { Cursor, OpenCode, Zed } from "@/components/icons/custom-icons";

export type Category = "languages" | "frontend" | "backend" | "devops" | "ai";

export interface Skill {
  name: string;
  category: Category;
  Icon: ComponentType<{ size?: number; className?: string }>;
  DarkIcon?: ComponentType<{ size?: number; className?: string }>;
  // Override the icon's brand colors with the foreground color so it
  // inverts with the theme. "fill" works for solid marks (Claude, OpenAI,
  // Vercel, GitHub); "stroke" for outline marks (Shadcn).
  tint?: "fill" | "stroke";
  // CSS-invert the icon in dark mode. Use when the icon has internal detail
  // (gradients, multi-color paths) that a flat tint would erase — e.g.
  // Next.js, where the "N" is a gradient over a solid circle.
  invert?: boolean;
}

export const SKILLS: Skill[] = [
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

  { name: "Zed", category: "ai", Icon: Zed, tint: "fill" },
  { name: "Cursor", category: "ai", Icon: Cursor, tint: "fill" },
  { name: "Figma", category: "ai", Icon: Figma },
  { name: "Claude", category: "ai", Icon: AnthropicBasicLight, DarkIcon: AnthropicBasicDark, tint: "fill" },
  { name: "Codex", category: "ai", Icon: OpenAI, tint: "fill" },
  { name: "OpenCode", category: "ai", Icon: OpenCode, tint: "fill" },
];
