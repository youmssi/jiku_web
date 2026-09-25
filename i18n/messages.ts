import type { Locale } from "./routing";

/**
 * Message namespaces, one catalog file per namespace and locale under
 * `messages/<locale>/<namespace>.json`. French is the reference catalog: its
 * shape types every `useTranslations` / `getTranslations` key (global.d.ts),
 * and `pnpm i18n:check` fails when another locale drifts from it.
 */
export const NAMESPACES = ["common", "auth", "shell", "events", "services", "guests", "feedback", "guest", "billing"] as const;

export type Namespace = (typeof NAMESPACES)[number];

export async function loadMessages(locale: Locale) {
  const catalogs = await Promise.all(
    NAMESPACES.map(async (namespace) => [namespace, (await import(`../messages/${locale}/${namespace}.json`)).default] as const),
  );
  return Object.fromEntries(catalogs) as Messages;
}

export interface Messages {
  common: typeof import("../messages/fr/common.json");
  auth: typeof import("../messages/fr/auth.json");
  shell: typeof import("../messages/fr/shell.json");
  events: typeof import("../messages/fr/events.json");
  services: typeof import("../messages/fr/services.json");
  guests: typeof import("../messages/fr/guests.json");
  feedback: typeof import("../messages/fr/feedback.json");
  guest: typeof import("../messages/fr/guest.json");
  billing: typeof import("../messages/fr/billing.json");
}
