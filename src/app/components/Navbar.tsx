import TabnewsNavbar from "@/components/icons/TabnewsNavbar";
import XNavbar from "@/components/icons/XNavbar";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ThemeButton from "./ThemeButton";
import GithubNavbar from "@/components/icons/GithubNavbar";

export default async function Navbar() {
  const t = await getTranslations("NavbarComponent");

  return (
    <nav className="flex items-center justify-between">
      <Link
        href="/"
        className="text-neutral-950 dark:text-neutral-100 font-medium text-xl max-sm:hidden"
      >
        Kauã Braz
      </Link>

      <div className="hidden items-center gap-5 max-md:gap-1 max-sm:flex">
        <Link
          href="/"
          className="leading-6 text-neutral-800 dark:text-neutral-300 py-1 px-2 rounded transition-colors duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
        >
          {t("home")}
        </Link>
        <Link
          href="/about"
          className="leading-6 text-neutral-800 dark:text-neutral-300 py-1 px-2 rounded transition-colors duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
        >
          {t("about")}
        </Link>
      </div>

      <div className="flex items-center gap-5 max-md:gap-1">
        <div className="max-sm:hidden">
          <ThemeButton />
        </div>
        <Link
          href="/about"
          className="leading-6 max-sm:hidden text-neutral-800 dark:text-neutral-300 py-2 px-4 rounded transition-colors duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
        >
          {t("about")}
        </Link>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="https://github.com/oKauaDev"
              aria-label="Meu perfil no GitHub"
              target="_blank"
              className="p-2 rounded transition-colors duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer text-neutral-800 dark:text-neutral-300"
            >
              <GithubNavbar />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("tooltip_github")}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="https://x.com/oKauaDev"
              aria-label="Meu perfil no X"
              target="_blank"
              className="p-2 rounded transition-colors duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer text-neutral-800 dark:text-neutral-300"
            >
              <XNavbar />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("tooltip_x")}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="https://www.tabnews.com.br/kauadev"
              aria-label="Meu perfil no Tabnews"
              target="_blank"
              className="p-2 rounded transition-colors duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer text-neutral-800 dark:text-neutral-300"
            >
              <TabnewsNavbar />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("tooltip_tabnews")}</p>
          </TooltipContent>
        </Tooltip>

        <div className="hidden max-sm:block">
          <ThemeButton />
        </div>
      </div>
    </nav>
  );
}
