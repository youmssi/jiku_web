import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { BIRTHDAY_TEXTS_CONTENT, BirthdayTextsPage } from "@/components/modules/landing";
import { localizedPageMetadata, siteUrl } from "@/components/modules/seo";
import { routing } from "@/i18n/routing";
import { SEO_ROUTES } from "@/lib/constants";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/** Birthday invitation texts page (JIKU-220), fr unprefixed and en under /en. */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const { meta } = BIRTHDAY_TEXTS_CONTENT[resolved];
  return {
    ...localizedPageMetadata({
      locale: resolved,
      defaultLocale: routing.defaultLocale,
      path: SEO_ROUTES.BIRTHDAY_TEXTS,
      title: meta.title,
      description: meta.description,
    }),
    keywords: meta.keywords,
  };
}

export default async function BirthdayTextsPageRoute({ params }: Readonly<PageProps>) {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  setRequestLocale(resolved);
  return <BirthdayTextsPage content={BIRTHDAY_TEXTS_CONTENT[resolved]} locale={resolved} siteUrl={siteUrl()} />;
}
