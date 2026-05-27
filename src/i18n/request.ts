import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";

type Messages = Record<string, unknown>;

const messageLoaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  pt: () => import("../../messages/pt.json"),
  en: () => import("../../messages/en.json"),
  es: () => import("../../messages/es.json"),
  zh: () => import("../../messages/zh.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await messageLoaders[locale as Locale]()).default,
  };
});
