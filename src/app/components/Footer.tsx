import { getTranslations } from "next-intl/server";
import Link from "next/link";
import React from "react";

export default async function Footer() {
  const t = await getTranslations("FooterComponent");

  return (
    <footer className="mt-24">
      <div className="w-full  flex items-center justify-between">
        <p className="text-neutral-600 dark:text-neutral-500">
          Kauã Braz (
          <Link
            className="text-neutral-800 dark:text-neutral-200 underline"
            href="https://github.com/kauabrazduarte"
          >
            @kauabrazduarte
          </Link>
          )
        </p>

        <Link
          className="text-neutral-800 dark:text-neutral-200 underline"
          href="https://github.com/kauabrazduarte/kaua.dev.br"
          target="_blank"
        >
          {t("source")}
        </Link>
      </div>

      <p className="text-neutral-600 dark:text-neutral-500 mt-8 text-center">{t("credits")}</p>
    </footer>
  );
}
