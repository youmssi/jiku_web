import { getLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { NotFoundPage } from "@/components/modules/landing";
import { routing } from "@/i18n/routing";

/** The site's own 404, in the visitor's language (JIKU-236). */
export default async function LocaleNotFound() {
  const raw = await getLocale();
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  return <NotFoundPage locale={locale} />;
}
