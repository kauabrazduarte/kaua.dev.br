import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-32 text-center">
      <p className="font-mono text-5xl font-medium text-primary">404</p>
      <h1 className="text-xl font-medium tracking-tight">
        Page not found · Página não encontrada
      </h1>
      <Link
        href="/"
        className="font-mono text-sm text-muted-foreground underline decoration-foreground/30 decoration-1 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
      >
        ← kaua.dev.br
      </Link>
    </div>
  );
}
