import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage, legalMetadata } from "@/components/modules/legal";
import { siteLocale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return legalMetadata("privacy", siteLocale(locale));
}

export default async function Page({ params }: Readonly<PageProps>) {
  const { locale } = await params;
  const resolved = siteLocale(locale);
  setRequestLocale(resolved);
  return <LegalPage id="privacy" locale={resolved} />;
}
