"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

export function CollapsibleExperiences({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("experience");
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="mt-7">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>{open ? t("showLess") : t("showAll")}</span>
        <ChevronDown
          aria-hidden
          className={`size-3.5 transition-transform duration-200 ${
            open ? "-rotate-180" : ""
          }`}
        />
      </button>
      {/* Rendered server-side and kept in the DOM for SEO; only visually toggled. */}
      <ol
        id={panelId}
        hidden={!open}
        className="mt-7 space-y-7 border-t border-border/60 pt-7"
      >
        {children}
      </ol>
    </div>
  );
}
