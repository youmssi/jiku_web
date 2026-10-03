import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { FaqPage, LANDING_CONTENT } from "@/components/modules/landing";
import { siteUrl } from "@/components/modules/seo";
import { routing } from "@/i18n/routing";
import { SEO_ROUTES } from "@/lib/constants";

interface PageProps {
  params: Promise<{ locale: string }>;
}

function resolveLocale(locale: string) {
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const { page } = LANDING_CONTENT[locale].faq;
  const canonical = locale === routing.defaultLocale ? SEO_ROUTES.FAQ : `/${locale}${SEO_ROUTES.FAQ}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical, languages: { fr: SEO_ROUTES.FAQ, en: `/en${SEO_ROUTES.FAQ}` } },
    openGraph: { type: "website", siteName: "Jikū", locale, title: page.title, description: page.description },
    twitter: { card: "summary_large_image", title: page.title, description: page.description },
  };
}

/** Dedicated FAQ page: fr unprefixed, en under /en. */
export default async function FaqPageRoute({ params }: Readonly<PageProps>) {
  const locale = resolveLocale((await params).locale);
  setRequestLocale(locale);
  return <FaqPage locale={locale} siteUrl={siteUrl()} />;
}
