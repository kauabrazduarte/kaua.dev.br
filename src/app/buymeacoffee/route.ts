// kaua.dev.br/buymeacoffee → my Buy Me a Coffee page. Bare vanity redirect,
// no locale prefix (excluded from the next-intl matcher in middleware.ts).
import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.redirect(siteConfig.links.buymeacoffee, 308);
}
