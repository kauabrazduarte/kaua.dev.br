import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run next-intl on every path *except* Next.js internals, root-level
  // metadata files (icon, apple-icon, opengraph-image, twitter-image) and
  // anything that has a file extension (sitemap.xml, robots.txt, …).
  matcher: [
    "/((?!api|_next|_vercel|icon|apple-icon|opengraph-image|twitter-image|.*\\..*).*)",
  ],
};
