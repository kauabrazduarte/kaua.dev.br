import { siteConfig } from "@/lib/site";
import OG from "./opengraph-image";

// Twitter card shares the same dimensions and visual as the OG image.
// We declare each metadata field inline (Next.js can't statically parse
// re-exported config) and delegate rendering to the OG generator.
export const runtime = "nodejs";
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default OG;
