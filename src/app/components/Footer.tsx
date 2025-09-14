import { getTranslations } from "next-intl/server";
import Link from "next/link";
import React from "react";

export default async function Footer() {
  const t = await getTranslations("FooterComponent");
  const phrases = await getTranslations("phrases");
  const phrases_count = 12;

  const random_number = Math.floor(Math.random() * phrases_count) + 1;
  const phrase = phrases(`phrase-${random_number}`);

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

      <p className="text-neutral-600 dark:text-neutral-500 mt-8 text-center">
        “{phrase}“
      </p>
    </footer>
  );
}
