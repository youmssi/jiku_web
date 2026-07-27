import { defineRouting } from "next-intl/routing";

/**
 * Canonical i18n routing config consumed by the proxy, the navigation helpers,
 * and the request handler. URLs carry the locale as the first segment for every
 * non-default locale (e.g. /en/dashboard) while the default locale stays
 * unprefixed (/dashboard) — so every pre-i18n URL, including invitation and
 * validator links already sent out, keeps resolving unchanged.
 *
 * When adding a new locale, extend `locales` and add a messages/<locale>.json
 * catalog with the same key structure as the existing ones.
 */
export const routing = defineRouting({
  locales: ["fr", "en"] as const,
  defaultLocale: "fr",
  // "as-needed" omits the prefix for the default locale (French, the primary
  // market) and keeps it explicit for every other locale (/en/...). Switching
  // to "always" later only requires changing this line.
  localePrefix: "as-needed",
  localeCookie: {
    name: "jiku.locale",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type Locale = (typeof routing.locales)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};
