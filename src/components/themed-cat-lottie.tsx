"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { GradientSpinner } from "@/components/gradient-spinner";

const noopSubscribe = () => () => {};

function CatLoadingSpinner() {
  return (
    <GradientSpinner
      rows={4}
      cols={4}
      cellSize={4}
      cellGap={2}
      period={900}
      label="Carregando gatinho…"
    />
  );
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => <Placeholder />,
});

function Placeholder() {
  return (
    <div className="flex aspect-[280/200] w-full items-center justify-center" aria-hidden>
      <CatLoadingSpinner />
    </div>
  );
}

// Map keyed by the original color's RGB triplet (exact float values from cat.json).
// Light palette = ginger cat: warm rust body, cream chest/belly, dark warm shadow.
// Dark palette = original colors, except shadows are muted to blend with the bg.
const COLOR_MAP: Record<string, { light?: number[]; dark?: number[] }> = {
  // 1. Focinho / nariz → #2C1A10 (preto-marrom quentíssimo)
  "0.008000000785,0.004000000393,0": { light: [0.1725, 0.102, 0.0627] },
  // 2. Orelhas (parte interna escura) → #4A2A18 (marrom escuro)
  "0.128999986836,0.141000007181,0.195999998205": {
    light: [0.2902, 0.1647, 0.0941],
  },
  // 3. Sombra interna do corpo → #9B3F1C (laranja-queimado mais profundo)
  "0.156999999402,0.180000005984,0.238999998803": {
    light: [0.6078, 0.2471, 0.1098],
  },
  // 4. Corpo / patas / cauda → #BE5828 (rust / laranja-ferrugem)
  "0.2,0.226999993418,0.305999995213": { light: [0.7451, 0.3451, 0.1569] },
  // 4b. Tail stroke (alt precision of the same color)
  "0.20000001496,0.227450995352,0.305882352941": {
    light: [0.7451, 0.3451, 0.1569],
  },
  // 5. Sombra do chão + rastro da cauda
  // light: #EED6BE (creme quente) · dark: #25252E (cinza escuro sutil)
  "0.6,0.6,0.760784313725": {
    light: [0.9333, 0.8392, 0.7451],
    dark: [0.1451, 0.1451, 0.1804],
  },
  "0.599679146561,0.599679146561,0.75925245098": {
    light: [0.9333, 0.8392, 0.7451],
    dark: [0.1451, 0.1451, 0.1804],
  },
  // 6. Barriga → #F4D8AE (creme quente / pêssego)
  "0.728999956916,0.757000014361,0.847000002394": {
    light: [0.9569, 0.8471, 0.6824],
  },
  // 7. Colar → #F7DEB9 (creme um tom mais claro)
  "0.851000019148,0.870999983245,0.929000016755": {
    light: [0.9686, 0.8706, 0.7255],
  },
};

function applyPalette(node: unknown, variant: "light" | "dark"): void {
  if (Array.isArray(node)) {
    for (const child of node) applyPalette(child, variant);
    return;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (
      "k" in obj &&
      Array.isArray(obj.k) &&
      obj.k.length === 4 &&
      obj.k.every((v) => typeof v === "number")
    ) {
      const k = obj.k as number[];
      const key = `${k[0]},${k[1]},${k[2]}`;
      const replacement = COLOR_MAP[key]?.[variant];
      if (replacement) obj.k = [...replacement, k[3]];
    }
    for (const v of Object.values(obj)) applyPalette(v, variant);
  }
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

let cache: unknown | null = null;

export function ThemedCatLottie({ className = "" }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const [raw, setRaw] = useState<unknown | null>(() => cache);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  useEffect(() => {
    if (cache) return;

    let cancelled = false;
    fetch("/cat.json", { cache: "force-cache" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        cache = json;
        setRaw(json);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const variant: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";

  const animationData = useMemo(() => {
    if (!raw || !mounted) return null;
    const copy = clone(raw);
    applyPalette(copy, variant);
    return copy;
  }, [raw, mounted, variant]);

  if (!animationData) {
    return (
      <div className={`flex aspect-[280/200] w-full items-center justify-center ${className}`} aria-hidden>
        <CatLoadingSpinner />
      </div>
    );
  }

  return (
    <div className={className} role="img" aria-label="Animated cat illustration">
      <Lottie
        key={variant}
        animationData={animationData}
        loop
        autoplay={!reducedMotion}
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
        className="h-full w-full"
      />
    </div>
  );
}
