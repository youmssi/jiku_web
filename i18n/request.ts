import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { loadMessages } from "./messages";
import { guestRouting } from "./routing";

/**
 * Resolves the active locale from the URL segment the proxy extracted and loads
 * the matching message catalog. An unsupported locale falls back to the default
 * rather than erroring — the locale layout is responsible for rendering 404.
 * Arabic exists only on the guest screens; the proxy keeps it there.
 * Catalogs are split by namespace (i18n/messages.ts) and merged here.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(guestRouting.locales, requested)
    ? requested
    : guestRouting.defaultLocale;
  return { locale, messages: await loadMessages(locale) };
});
