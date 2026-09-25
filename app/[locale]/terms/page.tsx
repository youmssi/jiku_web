import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { LegalPage, legalMetadata } from "@/components/modules/legal";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return legalMetadata("terms", hasLocale(routing.locales, locale) ? locale : routing.defaultLocale);
}

export default async function Page({ params }: Readonly<PageProps>) {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  setRequestLocale(resolved);
  return <LegalPage id="terms" locale={resolved} />;
}
