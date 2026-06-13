import { useMessages, useTranslations } from "next-intl";
import { siteConfig } from "@/lib/site";
import { interpolate } from "@/lib/interpolate";
import HeartIcon from "@/components/ui/heart-icon";

export function SiteFooter() {
  const t = useTranslations("footer");
  const messages = useMessages() as { footer: { builtWith: string } };
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="mx-auto w-full max-w-2xl px-6">
        <div className="paper-rule" aria-hidden />
        <div className="flex flex-col items-center justify-between gap-1 py-6 text-center sm:flex-row sm:items-center sm:text-left">
          <p className="font-mono text-[11px] text-muted-foreground">
            © {year} {siteConfig.name}
          </p>
          <p className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            {interpolate(messages.footer.builtWith, {
              heart: (
                <span className="inline-flex items-center text-primary [&_svg]:cursor-default">
                  <HeartIcon size={13} strokeWidth={2} />
                </span>
              ),
            })}
            <span className="sr-only">{t("rights")}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
