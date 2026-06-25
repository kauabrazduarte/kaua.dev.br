import type { Metadata } from "next";
import Link from "next/link";
import { commitMono } from "@/app/fonts";
import "./globals.css";

// Global fallback 404 — rendered for paths OUTSIDE the [locale] segment, where
// the minimal root layout provides no <html>/<body>, fonts, theme or i18n. So
// this page is fully self-contained. Locale-specific 404s live in
// [locale]/not-found.tsx (translated); this one is the neutral last resort.

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

// No next-themes provider here, so re-apply the persisted theme before paint to
// avoid a flash and stay theme-true (next-themes: class on <html>, storageKey
// "theme", default light → no class).
const themeScript =
  "try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}";

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={commitMono.variable}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-32 text-center">
          {/* --primary is the theme accent: amber/orange in light, violet in dark. */}
          <p className="font-mono text-7xl font-medium leading-none tracking-tight text-primary sm:text-8xl">
            404
          </p>

          <div className="space-y-2">
            <h1 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
              Page not found · Página não encontrada
            </h1>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
              The page you are looking for does not exist or may have been moved.
            </p>
          </div>

          <Link
            href="/"
            className="group mt-1 inline-flex items-center gap-1.5 font-mono text-sm text-foreground underline decoration-foreground/30 decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            <span
              aria-hidden
              className="transition-transform group-hover:-translate-x-0.5"
            >
              ←
            </span>
            kaua.dev.br
          </Link>
        </main>
      </body>
    </html>
  );
}
