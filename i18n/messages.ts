import type { GuestLocale } from "./routing";

/**
 * Message namespaces, one catalog file per namespace and locale under
 * `messages/<locale>/<namespace>.json`. French is the reference catalog: its
 * shape types every `useTranslations` / `getTranslations` key (global.d.ts),
 * and `pnpm i18n:check` fails when another locale drifts from it.
 *
 * Arabic covers only the namespaces the guest screens read (JIKU-292); every
 * other namespace, and any key it lacks, falls back to French.
 */
export const NAMESPACES = ["common", "auth", "shell", "events", "services", "guests", "feedback", "guest", "billing", "settings", "operator", "admin"] as const;

export type Namespace = (typeof NAMESPACES)[number];

/** The namespaces each partial locale translates; the others come from French. */
export const PARTIAL_LOCALES: Partial<Record<GuestLocale, readonly Namespace[]>> = {
  ar: ["common", "guest"],
};

async function catalog(locale: GuestLocale, namespace: Namespace): Promise<Record<string, unknown>> {
  return (await import(`../messages/${locale}/${namespace}.json`)).default;
}

export async function loadMessages(locale: GuestLocale) {
  const partial = PARTIAL_LOCALES[locale];
  const catalogs = await Promise.all(
    NAMESPACES.map(async (namespace) => {
      if (!partial) return [namespace, await catalog(locale, namespace)] as const;
      const french = await catalog("fr", namespace);
      return [namespace, partial.includes(namespace) ? withFallback(await catalog(locale, namespace), french) : french] as const;
    }),
  );
  return Object.fromEntries(catalogs) as unknown as Messages;
}

/** [translated] over [fallback], key by key, so an untranslated key reads in the fallback language. */
function withFallback(translated: Record<string, unknown>, fallback: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...fallback };
  for (const [key, value] of Object.entries(translated)) {
    const base = fallback[key];
    merged[key] = isObject(value) && isObject(base) ? withFallback(value, base) : value;
  }
  return merged;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
  settings: typeof import("../messages/fr/settings.json");
  operator: typeof import("../messages/fr/operator.json");
  admin: typeof import("../messages/fr/admin.json");
}
