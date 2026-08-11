// ─────────────────────────────────────────────
// Custom theme engine
//
// Lets the chat agent (custom_theme tool) paint the WHOLE site — including the
// cat — with an arbitrary palette. The theme is applied as inline CSS variables
// on <html> (which override both :root and .dark, since inline styles win over
// class selectors), persisted to localStorage, and surfaced through a tiny
// store so React components (the revert banner + the Lottie cat) can react.
// ─────────────────────────────────────────────

export const CUSTOM_THEME_STORAGE_KEY = "kauadevbr:custom-theme";
export const CUSTOM_THEME_EVENT = "chat:custom-theme";
export const CUSTOM_THEME_ATTR = "data-custom-theme";

// Colors the agent may pass. Only background/foreground/primary are required;
// the rest are derived from them when omitted.
export interface CustomThemeInput {
  name: string;
  background: string;
  foreground: string;
  primary: string;
  accent?: string;
  secondary?: string;
  muted?: string;
  border?: string;
  card?: string;
  popover?: string;
}

// Every CSS variable we manage — kept as a list so clearing removes exactly
// what we set (and nothing else).
export const CUSTOM_THEME_TOKENS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--border",
  "--input",
  "--paper-rule",
  "--ring",
  "--brand",
] as const;

// ── color helpers ──────────────────────────────

function normalizeHex(hex: string): string {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return "#" + h.toLowerCase();
}

function hexToRgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex).slice(1);
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Linear sRGB blend of two hex colors. `t` = weight of `b` (0 → a, 1 → b). */
function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(
    ar + (br - ar) * t,
    ag + (bg - ag) * t,
    ab + (bb - ab) * t,
  );
}

/** Relative luminance (0–1) of a hex color, for contrast decisions. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** A readable foreground (near-white or near-black) for text on `hex`. */
function readableOn(hex: string): string {
  return luminance(hex) > 0.5 ? "#141414" : "#faf7f2";
}

// ── token derivation ───────────────────────────

/**
 * Compute the full CSS variable map from the (partial) input. Derived tokens
 * use `color-mix(in oklab, …)` so tints track the chosen background/foreground.
 */
export function buildCustomThemeVars(
  input: CustomThemeInput,
): Record<string, string> {
  const bg = normalizeHex(input.background);
  const fg = normalizeHex(input.foreground);
  const primary = normalizeHex(input.primary);
  const mix = (pct: number) => `color-mix(in oklab, ${fg} ${pct}%, ${bg})`;

  return {
    "--background": bg,
    "--foreground": fg,
    "--card": input.card ? normalizeHex(input.card) : bg,
    "--card-foreground": fg,
    "--popover": input.popover ? normalizeHex(input.popover) : mix(4),
    "--popover-foreground": fg,
    "--primary": primary,
    "--primary-foreground": readableOn(primary),
    "--secondary": input.secondary ? normalizeHex(input.secondary) : mix(6),
    "--secondary-foreground": fg,
    "--muted": input.muted ? normalizeHex(input.muted) : mix(6),
    "--muted-foreground": mix(55),
    "--accent": input.accent ? normalizeHex(input.accent) : mix(10),
    "--accent-foreground": fg,
    "--border": input.border ? normalizeHex(input.border) : mix(14),
    "--input": input.border ? normalizeHex(input.border) : mix(14),
    "--paper-rule": mix(20),
    "--ring": primary,
    "--brand": primary,
  };
}

// ── the cat ────────────────────────────────────

/** RGB triplet keys inside cat.json, grouped by the body part they paint. */
const CAT_KEYS = {
  nose: ["0.008000000785,0.004000000393,0"],
  ears: ["0.128999986836,0.141000007181,0.195999998205"],
  shadow: ["0.156999999402,0.180000005984,0.238999998803"],
  body: [
    "0.2,0.226999993418,0.305999995213",
    "0.20000001496,0.227450995352,0.305882352941",
  ],
  ground: [
    "0.6,0.6,0.760784313725",
    "0.599679146561,0.599679146561,0.75925245098",
  ],
  belly: ["0.728999956916,0.757000014361,0.847000002394"],
  collar: ["0.851000019148,0.870999983245,0.929000016755"],
} as const;

function hexToFloatTriplet(hex: string): number[] {
  return hexToRgb(hex).map((v) => v / 255);
}

/**
 * Recolor the cat from a custom palette: the body becomes the theme's primary,
 * with darker shades for shadows/ears/nose and lighter tints for belly/collar,
 * and the ground shadow blended into the theme background.
 */
export function customCatPalette(
  primaryHex: string,
  backgroundHex: string,
): Record<string, number[]> {
  const primary = normalizeHex(primaryHex);
  const bg = normalizeHex(backgroundHex);
  const shades: Record<keyof typeof CAT_KEYS, string> = {
    nose: mixHex(primary, "#000000", 0.62),
    ears: mixHex(primary, "#000000", 0.48),
    shadow: mixHex(primary, "#000000", 0.26),
    body: primary,
    ground: mixHex(primary, bg, 0.62),
    belly: mixHex(primary, "#ffffff", 0.6),
    collar: mixHex(primary, "#ffffff", 0.72),
  };

  const map: Record<string, number[]> = {};
  (Object.keys(CAT_KEYS) as (keyof typeof CAT_KEYS)[]).forEach((part) => {
    const triplet = hexToFloatTriplet(shades[part]);
    for (const key of CAT_KEYS[part]) map[key] = triplet;
  });
  return map;
}

// ── persistence + reactive store ───────────────

interface StoredTheme {
  name: string;
  primary: string;
  background: string;
  vars: Record<string, string>;
}

/** Snapshot exposed to React consumers. */
export interface CustomThemeState {
  name: string;
  primary: string;
  background: string;
}

function readStored(): StoredTheme | null {
  try {
    const raw = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredTheme;
    if (!parsed || !parsed.vars) return null;
    return parsed;
  } catch {
    return null;
  }
}

function toState(stored: StoredTheme | null): CustomThemeState | null {
  return stored
    ? { name: stored.name, primary: stored.primary, background: stored.background }
    : null;
}

// Module-level cache — initialized once from storage on the client so the first
// post-hydration snapshot is correct. `null` on the server.
let currentState: CustomThemeState | null =
  typeof window !== "undefined" ? toState(readStored()) : null;

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CUSTOM_THEME_EVENT));
  }
}

/** Subscribe for useSyncExternalStore. */
export function subscribeCustomTheme(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === CUSTOM_THEME_STORAGE_KEY) {
      currentState = toState(readStored());
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function getCustomThemeSnapshot(): CustomThemeState | null {
  return currentState;
}

export function getCustomThemeServerSnapshot(): CustomThemeState | null {
  return null;
}

/** Apply + persist a custom theme, repainting the site and the cat. */
export function applyCustomTheme(input: CustomThemeInput): void {
  const vars = buildCustomThemeVars(input);
  const el = document.documentElement;
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
  el.setAttribute(CUSTOM_THEME_ATTR, input.name || "custom");

  const stored: StoredTheme = {
    name: input.name || "Custom",
    primary: normalizeHex(input.primary),
    background: normalizeHex(input.background),
    vars,
  };
  try {
    localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // quota / unavailable — theme still applies for this session
  }
  currentState = toState(stored);
  emit();
}

/** Remove the custom theme and fall back to the light/dark theme. */
export function clearCustomTheme(): void {
  const el = document.documentElement;
  for (const token of CUSTOM_THEME_TOKENS) el.style.removeProperty(token);
  el.removeAttribute(CUSTOM_THEME_ATTR);
  try {
    localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
  } catch {
    // ignore
  }
  currentState = null;
  emit();
}

// ── FOUC guard ─────────────────────────────────

// Runs before paint (injected in <head>) so a persisted custom theme is applied
// synchronously and never flashes the default palette on reload.
export const CUSTOM_THEME_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem('${CUSTOM_THEME_STORAGE_KEY}');if(!s)return;var t=JSON.parse(s);if(!t||!t.vars)return;var el=document.documentElement;for(var k in t.vars){el.style.setProperty(k,t.vars[k]);}el.setAttribute('${CUSTOM_THEME_ATTR}',t.name||'custom');}catch(e){}})();`;
