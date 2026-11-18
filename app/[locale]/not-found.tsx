import { getLocale } from "next-intl/server";
import { NotFoundPage } from "@/components/modules/landing/not-found";
import { siteLocale } from "@/i18n/routing";

/** The site's own 404, in the visitor's language (JIKU-236). */
export default async function LocaleNotFound() {
  const raw = await getLocale();
  const locale = siteLocale(raw);
  return <NotFoundPage locale={locale} />;
}
