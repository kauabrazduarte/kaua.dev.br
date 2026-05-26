import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // `id` pins this app's identity across installs and reinstalls (PWA
    // best practice — recommended by Lighthouse). Tied to the canonical
    // root so it never drifts even if start_url changes.
    id: "/",
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    // Manifest is served from a single locale-agnostic URL, so we pick the
    // site's default locale (Portuguese). Browsers that surface the manifest
    // (install prompts, OS app lists) will show this string regardless of
    // the user's chosen page locale.
    lang: "pt-BR",
    description: siteConfig.description.pt,
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#0c0a14",
    icons: [
      // /icon and /apple-icon are generated dynamically by icon.tsx /
      // apple-icon.tsx. Browsers downscale the 256² PNG as needed.
      { src: "/icon", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
