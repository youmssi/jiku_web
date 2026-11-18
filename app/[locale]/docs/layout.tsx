import { setRequestLocale } from "next-intl/server";
import { DocsShell } from "@/components/modules/docs";
import { siteLocale } from "@/i18n/routing";

/** The guides' frame, in the visitor's locale (JIKU-235). */
export default async function DocsLayoutRoute({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale: raw } = await params;
  const locale = siteLocale(raw);
  setRequestLocale(locale);
  return <DocsShell locale={locale}>{children}</DocsShell>;
}
