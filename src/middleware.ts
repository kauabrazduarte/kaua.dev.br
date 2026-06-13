import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run next-intl on every path *except* Next.js internals, root-level
  // metadata files (icon, apple-icon, opengraph-image, twitter-image), the
  // bare redirect routes (/x, /email, /buymeacoffee — handled by their own
  // Route Handlers, must NOT get a locale prefix) and anything that has a file
  // extension (sitemap.xml, robots.txt, …).
  matcher: [
    "/((?!api|_next|_vercel|icon|apple-icon|opengraph-image|twitter-image|x|email|buymeacoffee|.*\\..*).*)",
  ],
};
