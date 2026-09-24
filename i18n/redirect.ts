import "server-only";

import { getLocale } from "next-intl/server";

import { redirect } from "./navigation";

/**
 * Redirects to [href] in the locale of the current request, so a visitor on
 * `/en/...` stays in English after a guard or a form submission. For Server
 * Components and Server Actions; client code uses `useRouter` from
 * `@/i18n/navigation`.
 */
export async function localeRedirect(href: string): Promise<never> {
  return redirect({ href, locale: await getLocale() });
}
