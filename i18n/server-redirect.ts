import { getLocale } from "next-intl/server";

import { redirect as intlRedirect } from "./navigation";

/**
 * Server-side redirect that preserves the active locale. next-intl's redirect
 * requires the locale explicitly; most server callers want the current one, so
 * this provides it automatically to keep call sites simple.
 *
 * Use from layouts, pages, and route handlers that render UI. Pure data routes
 * under app/api/ keep using next/navigation's redirect.
 */
export async function redirectLocalized(href: string): Promise<void> {
  const locale = await getLocale();
  intlRedirect({ href, locale });
}
