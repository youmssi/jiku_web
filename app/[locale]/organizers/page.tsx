import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ORGANIZERS_CONTENT, OrganizersPage, organizersContent } from "@/components/modules/landing";
import { localizedPageMetadata, siteUrl } from "@/components/modules/seo";
import { routing } from "@/i18n/routing";
import { SEO_ROUTES } from "@/lib/constants";
import { visitorCurrency } from "@/lib/visitor-currency";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/** The page for professional event organizers (JIKU-266), fr unprefixed and en under /en. */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const { meta } = ORGANIZERS_CONTENT[resolved];
  return {
    ...localizedPageMetadata({
      locale: resolved,
      defaultLocale: routing.defaultLocale,
      path: SEO_ROUTES.ORGANIZERS,
      title: meta.title,
      description: meta.description,
    }),
    keywords: meta.keywords,
  };
}

export default async function OrganizersPageRoute({ params }: Readonly<PageProps>) {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  setRequestLocale(resolved);
  const content = organizersContent(resolved, await visitorCurrency(resolved));
  return <OrganizersPage content={content} locale={resolved} siteUrl={siteUrl()} />;
}
