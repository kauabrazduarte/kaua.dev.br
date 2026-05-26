import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  kicker?: string;
  title?: string;
  subtitle?: string;
  rule?: boolean;
}

// Tight, paper-like section. No card surface. Sections are separated by a
// hairline "page rule" — set `rule` to draw it on top of the section.
export function Section({
  className,
  kicker,
  title,
  subtitle,
  children,
  id,
  rule = true,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-20", className)}
      {...props}
    >
      <div className="mx-auto w-full max-w-2xl px-6">
        {rule ? <div className="paper-rule" aria-hidden /> : null}
        <div className="py-10 sm:py-12">
          {(kicker || title || subtitle) && (
            <header className="mb-5 flex flex-col gap-1">
              {kicker ? (
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {kicker}
                </span>
              ) : null}
              {title ? (
                <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                  {title}
                </h2>
              ) : null}
              {subtitle ? (
                <p className="text-sm text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </header>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
