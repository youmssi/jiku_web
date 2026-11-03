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

/**
 * The guest screens (JIKU-292) also read in Arabic: the card, the RSVP page, the
 * ticket, the sale and order pages, an organizer's public page, and a client's
 * booking and queue pages. The rest of
 * the site stays in French and English, so Arabic is a separate routing that
 * only the proxy, the root layout and the guest screens use.
 */
export const guestRouting = defineRouting({
  ...routing,
  locales: ["fr", "en", "ar"] as const,
});

export type GuestLocale = (typeof guestRouting.locales)[number];

/** The guest locales the rest of the site does not have. */
export const GUEST_ONLY_LOCALES: readonly GuestLocale[] = ["ar"];

/** The writing direction of a locale: Arabic reads right to left. */
export function localeDirection(locale: string): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Locale-stripped prefixes of the guest screens, the only ones served in every guest locale. */
const GUEST_PREFIXES = ["/appointments/", "/c/", "/i/", "/invitation/", "/o/", "/orders/", "/r/", "/v/", "/widget/"];

export function isGuestRoute(route: string): boolean {
  return GUEST_PREFIXES.some((prefix) => route.startsWith(prefix));
}

export const LOCALE_LABELS: Record<GuestLocale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};
