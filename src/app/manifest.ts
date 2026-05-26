import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description.en,
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
