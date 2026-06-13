"use client";

import { useTranslations } from "next-intl";
import { Link as LinkIcon, Menu, QrCode } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hamburger nav, styled after the LanguageToggle dropdown. Lives to the right of
// the theme button and points at the standalone pages (Links, Pix). Labels come
// from the `nav` namespace so they're translated.
export function MenuToggle() {
  const t = useTranslations("nav");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("menu")}
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("menu")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/links">
            <LinkIcon className="size-4" />
            {t("menuLinks")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/pix">
            <QrCode className="size-4" />
            {t("menuPix")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
