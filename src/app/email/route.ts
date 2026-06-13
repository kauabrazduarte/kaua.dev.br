// kaua.dev.br/email → opens a mail composer to my address (mailto:). Bare
// vanity redirect, no locale prefix (excluded from the next-intl matcher).
import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.redirect(siteConfig.links.email, 308);
}
