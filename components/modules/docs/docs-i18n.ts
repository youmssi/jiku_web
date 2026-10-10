import { defineI18n } from "fumadocs-core/i18n";
import { routing } from "@/i18n/routing";

/**
 * The guides follow the site's locales: French unprefixed at /docs, English
 * at /en/docs (next-intl resolves the URL; Fumadocs only reads the locale).
 * Each guide lives in content/docs/<locale>/; a page missing in English falls
 * back to French.
 */
export const docsI18n = defineI18n({
  languages: [...routing.locales],
  defaultLanguage: routing.defaultLocale,
  hideLocale: "default-locale",
  parser: "dir",
});
