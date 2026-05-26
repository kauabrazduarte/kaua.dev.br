"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors",
        scrolled ? "bg-background/80 backdrop-blur" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-12 w-full max-w-2xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-[13px] text-foreground"
          aria-label="kaua.dev.br"
        >
          kaua<span className="text-muted-foreground">.dev.br</span>
        </Link>

        <div className="flex items-center gap-0.5">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
