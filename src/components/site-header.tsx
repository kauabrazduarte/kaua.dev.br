import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { MenuToggle } from "@/components/menu-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/55 backdrop-blur-2xl backdrop-saturate-150">
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
          <MenuToggle />
        </div>
      </div>
    </header>
  );
}
